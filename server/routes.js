import { createServer } from "http";
import { storage } from "./storage.js";
import { generateAnonymousName, generateSessionId } from "./services/anonymousNames.js";
import { analyzeEmotionAndGenerateComfort, generateAIComfortMessage, detectCrisisContent } from "./services/openai.js";
import { filterContent, validateContentLength, sanitizeContent } from "./services/contentFilter.js";
import { insertUserSchema, insertEmotionEntrySchema, insertChatMessageSchema } from "../shared/schema.js";

export async function registerRoutes(app) {
  const httpServer = createServer(app);
  
  // Store active connections (WebSocket server temporarily disabled to avoid conflicts)
  const activeConnections = new Map();
  
  // TODO: Re-enable WebSocket server after resolving Vite WebSocket conflicts
  // const wss = new WebSocketServer({ 
  //   server: httpServer,
  //   path: '/api/ws'
  // });

  // Anonymous user creation/retrieval
  app.post('/api/auth/anonymous', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (sessionId) {
        // Try to find existing user
        const existingUser = await storage.getUserBySessionId(sessionId);
        if (existingUser) {
          return res.json(existingUser);
        }
      }
      
      // Create new anonymous user
      const newSessionId = generateSessionId();
      const anonymousName = generateAnonymousName();
      
      const userData = insertUserSchema.parse({
        anonymousName,
        sessionId: newSessionId,
      });
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Anonymous auth error:', error);
      res.status(500).json({ error: 'Failed to create anonymous user' });
    }
  });

  // Emotion analysis and AI comfort
  app.post('/api/emotions/analyze', async (req, res) => {
    try {
      const { content, userId } = req.body;
      
      if (!validateContentLength(content)) {
        return res.status(400).json({ error: 'Invalid content length' });
      }
      
      const sanitizedContent = sanitizeContent(content);
      const filterResult = filterContent(sanitizedContent);
      
      if (filterResult.isFiltered) {
        return res.status(400).json({ 
          error: filterResult.reason,
          filteredContent: filterResult.filteredContent 
        });
      }
      
      // Crisis detection
      if (filterResult.isCrisis) {
        const crisisResult = await detectCrisisContent(sanitizedContent);
        if (crisisResult.isCrisis && crisisResult.severity >= 7) {
          return res.json({
            isCrisis: true,
            severity: crisisResult.severity,
            resources: [
              '생명의전화: 1393',
              '청소년전화: 1388',
              '정신건강위기상담전화: 1577-0199',
              '자살예방상담전화: 109'
            ],
            message: '전문가의 도움이 필요한 상황입니다. 위의 상담전화로 연락해보세요.'
          });
        }
      }
      
      const analysis = await analyzeEmotionAndGenerateComfort(sanitizedContent);
      
      // Store emotion analysis in database
      if (userId) {
        try {
          await storage.createEmotionAnalysis({
            userId,
            content: sanitizedContent,
            detectedEmotion: analysis.emotion,
            confidence: analysis.confidence,
            aiResponse: analysis.comfortMessage,
          });
        } catch (dbError) {
          console.error('Failed to store emotion analysis:', dbError);
        }
      }
      
      res.json(analysis);
    } catch (error) {
      console.error('Emotion analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze emotion' });
    }
  });

  // Create emotion diary entry
  app.post('/api/diary', async (req, res) => {
    try {
      const entryData = insertEmotionEntrySchema.parse(req.body);
      const sanitizedContent = sanitizeContent(entryData.content || '');
      
      const entry = await storage.createEmotionEntry({
        ...entryData,
        content: sanitizedContent,
      });
      
      res.json(entry);
    } catch (error) {
      console.error('Create diary entry error:', error);
      res.status(500).json({ error: 'Failed to create diary entry' });
    }
  });

  // Get user's diary entries
  app.get('/api/diary', async (req, res) => {
    try {
      const { userId, limit = 50 } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const entries = await storage.getUserEmotionEntries(parseInt(userId), parseInt(limit));
      res.json(entries);
    } catch (error) {
      console.error('Get diary entries error:', error);
      res.status(500).json({ error: 'Failed to get diary entries' });
    }
  });

  // Get user statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const stats = await storage.getUserEmotionStats(parseInt(userId));
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  });

  // Chat matching - find or create chat session
  app.post('/api/chat/match', async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Try to find an available chat session
      let session = await storage.findAvailableChatSession();
      
      if (session && session.user1Id !== userId) {
        // Join existing session
        session = await storage.joinChatSession(session.id, userId);
      } else {
        // Create new session
        session = await storage.createChatSession({ user1Id: userId, isActive: true });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Chat matching error:', error);
      res.status(500).json({ error: 'Failed to match chat' });
    }
  });

  // Send chat message
  app.post('/api/chat/message', async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const sanitizedContent = sanitizeContent(messageData.content);
      
      const filterResult = filterContent(sanitizedContent);
      if (filterResult.isFiltered) {
        return res.status(400).json({ 
          error: filterResult.reason,
          filteredContent: filterResult.filteredContent 
        });
      }
      
      const message = await storage.createChatMessage({
        ...messageData,
        content: sanitizedContent,
      });
      
      // Check if AI should respond based on emotion analysis
      if (filterResult.isCrisis || Math.random() < 0.3) { // 30% chance for AI comfort
        const analysis = await analyzeEmotionAndGenerateComfort(sanitizedContent);
        
        const aiMessage = await storage.createChatMessage({
          sessionId: messageData.sessionId,
          senderId: messageData.senderId, // Use same sender ID but mark as AI
          content: analysis.comfortMessage,
          isAiMessage: true,
          aiComfortType: 'comfort',
        });
        
        // Send AI message via WebSocket if connection exists
        const session = await storage.getChatSession(messageData.sessionId);
        if (session) {
          const recipientId = session.user1Id === messageData.senderId ? session.user2Id : session.user1Id;
          const recipientWs = activeConnections.get(recipientId?.toString());
          if (recipientWs) {
            recipientWs.send(JSON.stringify({ type: 'new_message', message: aiMessage }));
          }
        }
      }
      
      res.json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get chat messages
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const { sessionId, limit = 50 } = req.query;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }
      
      const messages = await storage.getChatMessages(parseInt(sessionId), parseInt(limit));
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  return httpServer;
}
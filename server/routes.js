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
      
      try {
        const analysis = await analyzeEmotionAndGenerateComfort(sanitizedContent);
        
        const analysisData = {
          userId,
          content: sanitizedContent,
          detectedEmotion: analysis.emotion,
          confidence: analysis.confidence,
          aiResponse: analysis.comfortMessage,
        };
        
        await storage.createEmotionAnalysis(analysisData);
        res.json(analysis);
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        // Return fallback response without AI
        res.json({
          emotion: 'neutral',
          confidence: 50,
          comfortMessage: '감정을 표현해주셔서 감사합니다. 지금 느끼시는 마음을 이해합니다.',
          needsSupport: false
        });
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze emotion' });
    }
  });

  // Save emotion entry (diary)
  app.post('/api/emotions/entry', async (req, res) => {
    try {
      const entryData = insertEmotionEntrySchema.parse(req.body);
      
      if (entryData.content && !validateContentLength(entryData.content)) {
        return res.status(400).json({ error: 'Content too long' });
      }
      
      const entry = await storage.createEmotionEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error('Emotion entry error:', error);
      res.status(500).json({ error: 'Failed to save emotion entry' });
    }
  });

  // Get user emotion entries
  app.get('/api/emotions/entries/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getUserEmotionEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error('Get entries error:', error);
      res.status(500).json({ error: 'Failed to get emotion entries' });
    }
  });

  // Get user emotion statistics
  app.get('/api/emotions/stats/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserEmotionStats(userId);
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
        try {
          const analysis = await analyzeEmotionAndGenerateComfort(sanitizedContent);
          
          const aiMessage = await storage.createChatMessage({
            sessionId: messageData.sessionId,
            senderId: messageData.senderId,
            content: analysis.comfortMessage,
            isAiMessage: true,
            aiComfortType: 'comfort',
          });
          
          // Send AI message via WebSocket if connection exists
          const session = await storage.getChatSession(messageData.sessionId);
          if (session) {
            const recipientId = session.user1Id === messageData.senderId ? session.user2Id : session.user1Id;
            const ws = activeConnections.get(recipientId?.toString());
            if (ws) {
              ws.send(JSON.stringify({ type: 'message', data: aiMessage }));
            }
          }
        } catch (aiError) {
          console.error('AI response error:', aiError);
        }
      }
      
      res.json(message);
    } catch (error) {
      console.error('Chat message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get chat messages
  app.get('/api/chat/:sessionId/messages', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  return httpServer;
}
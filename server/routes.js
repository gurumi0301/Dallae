import { createServer } from "http";
import { storage } from "./storage.js";
import { generateAnonymousName, generateSessionId } from "./services/anonymousNames.js";
import { analyzeEmotionAndGenerateComfort, generateAIComfortMessage, detectCrisisContent } from "./services/openai.js";
import { filterContent, validateContentLength, sanitizeContent } from "./services/contentFilter.js";
import { insertUserSchema, insertEmotionSchema } from "../shared/schema.js";
import { hashPassword, verifyPassword, generateToken, verifyToken, verifyRealName, getUserByUsername } from './auth.js';
import { db, pool } from './db.js';
import { eq } from 'drizzle-orm';

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
      
      const userData = {
        anonymousName,
        sessionId: newSessionId,
      };
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Anonymous auth error:', error);
      res.status(500).json({ error: 'Failed to create anonymous user' });
    }
  });

  // 회원가입
  app.post('/api/auth/register', async (req, res) => {
    try {
      // 간단한 유효성 검사
      const { username, password, realName, email, phone } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ error: '아이디는 3자 이상이어야 합니다' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다' });
      }
      if (!realName || realName.length < 2) {
        return res.status(400).json({ error: '실명은 2자 이상이어야 합니다' });
      }
      
      const userData = { username, password, realName, email, phone };
      
      // 사용자명 중복 체크
      const existingUser = await getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: '이미 존재하는 아이디입니다' });
      }
      
      // 실명 인증
      const verification = await verifyRealName(userData.realName, userData.phone);
      
      // 비밀번호 해시화
      const hashedPassword = await hashPassword(userData.password);
      
      // 사용자 생성
      // 사용자 생성 (registered_users 테이블 사용)
      const insertQuery = `
        INSERT INTO registered_users (username, password, real_name, email, phone, verification_token) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, username, real_name as "realName"
      `;
      
      const result = await pool.query(insertQuery, [
        userData.username, 
        hashedPassword, 
        userData.realName, 
        userData.email, 
        userData.phone, 
        verification.verificationCode
      ]);
      
      const user = result.rows[0];
      
      if (verification.verified) {
        // 바로 인증 완료
        const token = generateToken(user);
        res.json({ user: { id: user.id, username: user.username, realName: user.realName }, token });
      } else {
        // 인증 대기
        res.json({ requiresVerification: true, userId: user.id });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message || '회원가입에 실패했습니다' });
    }
  });

  // 인증 코드 확인
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { username, verificationCode } = req.body;
      
      const query = `SELECT * FROM registered_users WHERE username = $1`;
      const result = await pool.query(query, [username]);
      const user = result.rows[0];
      
      if (!user || user.verificationToken !== verificationCode) {
        return res.status(400).json({ error: '인증 코드가 올바르지 않습니다' });
      }
      
      // 인증 완료 처리
      const updateQuery = `UPDATE registered_users SET is_verified = true, verification_token = null WHERE id = $1`;
      await pool.query(updateQuery, [user.id]);
      
      const token = generateToken(user);
      res.json({ user: { id: user.id, username: user.username, realName: user.realName }, token });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(400).json({ error: '인증에 실패했습니다' });
    }
  });

  // 로그인
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요' });
      }
      
      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다' });
      }
      
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다' });
      }
      
      const token = generateToken(user);
      res.json({ user: { id: user.id, username: user.username, realName: user.realName }, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: '로그인에 실패했습니다' });
    }
  });

  // 심리검사 가져오기
  app.get('/api/psychology-tests/default', async (req, res) => {
    try {
      // const query = `SELECT * FROM psychology_tests WHERE is_active = true LIMIT 1`;
      // const result = await pool.query(query);
      // const test = result.rows[0];
      
      if (!test) {
        return res.status(404).json({ error: '심리검사를 찾을 수 없습니다' });
      }
      
      res.json(test);
    } catch (error) {
      console.error('Psychology test fetch error:', error);
      res.status(500).json({ error: '심리검사를 불러올 수 없습니다' });
    }
  });

  // 심리검사 결과 제출
  app.post('/api/psychology-tests/submit', async (req, res) => {
    try {
      const { testId, answers } = req.body;
      
      // 임시 사용자 ID (실제로는 인증 미들웨어에서 가져와야 함)
      const userId = 1;
      
      // 점수 계산
      const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
      const maxScore = Object.keys(answers).length * 5;
      const normalizedScore = Math.round((totalScore / maxScore) * 100);
      
      // 결과 분석
      let analysis = '';
      let recommendations = [];
      let categories = [];
      
      if (normalizedScore >= 80) {
        analysis = '매우 좋은 심리 상태를 보이고 있습니다. 현재의 긍정적인 상태를 유지하시기 바랍니다.';
        recommendations = [
          '현재의 좋은 상태를 유지하기 위해 규칙적인 생활 패턴을 지속하세요',
          '가족과 친구들과의 관계를 소중히 하세요',
          '적당한 운동과 취미 활동을 계속하세요'
        ];
      } else if (normalizedScore >= 60) {
        analysis = '전반적으로 양호한 심리 상태입니다. 일부 개선할 부분이 있지만 큰 문제는 없습니다.';
        recommendations = [
          '스트레스 관리 방법을 익혀보세요',
          '충분한 휴식과 수면을 취하세요',
          '긍정적인 사고를 연습해보세요'
        ];
      } else if (normalizedScore >= 40) {
        analysis = '보통 수준의 심리 상태입니다. 몇 가지 영역에서 관심과 개선이 필요합니다.';
        recommendations = [
          '전문가와의 상담을 고려해보세요',
          '정기적인 운동으로 스트레스를 해소하세요',
          '마음챙김이나 명상을 시도해보세요'
        ];
      } else {
        analysis = '심리적 지원이 필요한 상태입니다. 전문가의 도움을 받으시길 권합니다.';
        recommendations = [
          '전문 상담사나 심리치료사와 상담하세요',
          '신뢰할 수 있는 사람들과 이야기하세요',
          '충분한 휴식과 자기 돌봄에 집중하세요'
        ];
      }
      
      // 카테고리별 점수 (간단한 예시)
      categories = [
        { name: '기분 상태', score: Math.min(20, Math.round(normalizedScore / 5)) },
        { name: '수면 질', score: Math.min(20, Math.round((normalizedScore + 10) / 5)) },
        { name: '스트레스 관리', score: Math.min(20, Math.round((normalizedScore - 5) / 5)) },
        { name: '인간관계', score: Math.min(20, Math.round(normalizedScore / 5)) },
        { name: '활력도', score: Math.min(20, Math.round((normalizedScore + 5) / 5)) }
      ];
      
      const results = {
        totalScore: normalizedScore,
        analysis,
        recommendations,
        categories
      };
      
      // 결과 저장
      const insertResultQuery = `
        INSERT INTO psychology_test_results (user_id, test_id, answers, results, score) 
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(insertResultQuery, [
        userId, 
        testId, 
        JSON.stringify(answers), 
        JSON.stringify(results), 
        normalizedScore
      ]);
      
      res.json({ results });
    } catch (error) {
      console.error('Psychology test submission error:', error);
      res.status(500).json({ error: '심리검사 제출에 실패했습니다' });
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
        
        // 감정 분석 결과를 저장하는 메서드는 향후 구현 예정
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
      const { emotion, intensity, note, anonymousUserId } = req.body;
      
      const entryData = {
        emotion,
        intensity,
        note,
        anonymousUserId
      };
      
      if (note && !validateContentLength(note)) {
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
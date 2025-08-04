// server/routes/chat.js
import { Router } from 'express';
import { storage } from '../storage.js';
import { sanitizeContent, filterContent } from '../services/contentFilter.js';
import { analyzeEmotionAndGenerateComfort } from '../services/openai.js';
import { insertChatMessageSchema } from '../../shared/schema.js';

const router = Router();

// 채팅 매칭
router.post('/match', async (req, res) => {
  try {
    const { userId } = req.body;
    let session = await storage.findAvailableChatSession();

    if (session && session.user1Id !== userId) {
      session = await storage.joinChatSession(session.id, userId);
    } else {
      session = await storage.createChatSession({ user1Id: userId, isActive: true });
    }

    res.json(session);
  } catch (error) {
    console.error('Chat matching error:', error);
    res.status(500).json({ error: 'Failed to match chat' });
  }
});

// 채팅 메시지 저장
router.post('/message', async (req, res) => {
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

    // AI 응답 생성 조건
    if (filterResult.isCrisis || Math.random() < 0.3) {
      try {
        const analysis = await analyzeEmotionAndGenerateComfort(sanitizedContent);

        await storage.createChatMessage({
          sessionId: messageData.sessionId,
          senderId: messageData.senderId,
          content: analysis.comfortMessage,
          isAiMessage: true,
          aiComfortType: 'comfort',
        });
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

// 채팅 메시지 조회
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const messages = await storage.getChatMessages(sessionId);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;

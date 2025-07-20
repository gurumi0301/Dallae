import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useAnonymousUser } from '../hooks/useAnonymousUser.js';
import { matchChat, getChatMessages, sendChatMessage } from '../lib/api.js';
import ChatMessage from '../components/ChatMessage.jsx';

export default function Chat() {
  const [, params] = useRoute('/chat/:sessionId?');
  const { user } = useAnonymousUser();
  const [currentSession, setCurrentSession] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const sessionId = params?.sessionId || currentSession?.id;

  // Chat matching mutation
  const matchMutation = useMutation({
    mutationFn: ({ userId }) => matchChat(userId),
    onSuccess: (session) => {
      setCurrentSession(session);
      setIsMatching(false);
    },
    onError: (error) => {
      console.error('Chat matching failed:', error);
      setIsMatching(false);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries(['chat-messages', sessionId]);
    },
    onError: (error) => {
      console.error('Send message failed:', error);
    },
  });

  // Messages query
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => getChatMessages(sessionId),
    enabled: !!sessionId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartChat = () => {
    if (!user) return;
    setIsMatching(true);
    matchMutation.mutate({ userId: user.id });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !sessionId || !user) return;

    sendMessageMutation.mutate({
      sessionId: sessionId,
      senderId: user.id,
      content: messageText.trim(),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!sessionId && !isMatching) {
    return (
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <h1 className="text-xl font-bold text-gray-800 text-center">익명 대화</h1>
        </div>

        {/* Chat Introduction */}
        <div className="p-6">
          <div className="card text-center mb-6">
            <div className="w-16 h-16 soft-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              익명으로 대화해보세요
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              비슷한 감정을 느끼는 다른 분과 안전하게 대화할 수 있어요.
              모든 대화는 완전히 익명으로 진행됩니다.
            </p>
            <button
              onClick={handleStartChat}
              className="btn btn-primary"
            >
              대화 시작하기
            </button>
          </div>

          {/* Chat Guidelines */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">대화 가이드</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>서로의 감정을 존중하고 공감해주세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>개인정보는 절대 공유하지 마세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>부적절한 내용은 자동으로 필터링됩니다</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>AI가 필요시 위로 메시지를 제공해요</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMatching) {
    return (
      <div className="min-h-screen pb-20">
        <div className="p-6 border-b bg-white">
          <h1 className="text-xl font-bold text-gray-800 text-center">대화 연결 중</h1>
        </div>
        <div className="flex items-center justify-center mt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-soft-blue-200 border-t-soft-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">다른 사용자와 연결 중입니다...</p>
            <p className="text-gray-500 text-sm mt-2">잠시만 기다려 주세요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">익명 대화</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">연결됨</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messagesLoading ? (
          <div className="text-center text-gray-500">메시지를 불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.reverse().map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === user.id && !message.isAiMessage}
                isAI={message.isAiMessage}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-3">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="form-textarea flex-1"
            rows="2"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="btn btn-primary px-4 py-2 self-end"
          >
            {sendMessageMutation.isPending ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}
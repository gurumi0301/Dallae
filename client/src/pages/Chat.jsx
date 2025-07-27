import React, { useState, useRef, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import '../styles/Chat.css';

export default function Chat() {
  const { user } = useAnonymousUser();
  const [isMatching, setIsMatching] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startMatching = async () => {
    if (!user) return;
    
    setIsMatching(true);
    try {
      // 실제 매칭 대신 데모용 채팅 세션 시작
      const demoSession = {
        id: 'demo-session-' + Date.now(),
        participants: [user.id, 'demo-partner'],
        partnerName: '익명의 친구'
      };
      setChatSession(demoSession);
      
      // 환영 메시지 추가
      setTimeout(() => {
        setMessages([{
          id: 1,
          senderId: 'demo-partner',
          senderName: '익명의 친구',
          text: '안녕하세요! 오늘 기분은 어떠신가요?',
          timestamp: new Date(),
          isOwn: false
        }]);
      }, 1000);
    } catch (error) {
      console.error('Chat matching error:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession || !user) return;

    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.anonymousName,
      text: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // 상대방 타이핑 표시
    setIsTyping(true);
    
    // 자동 응답 시뮬레이션
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        '그렇군요. 더 자세히 말씀해주세요.',
        '저도 비슷한 경험이 있어요.',
        '힘드시겠어요. 괜찮으시나요?',
        '좋은 생각이네요!',
        '저는 그럴 때 음악을 들어요.',
        '오늘은 어떤 하루였나요?'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: 'demo-partner',
        senderName: '익명의 친구',
        text: randomResponse,
        timestamp: new Date(),
        isOwn: false
      }]);
    }, 1500 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!chatSession) {
    return (
      <div className="chat-container">
        <header className="chat-header">
          <h1 className="page-title">익명 채팅</h1>
          <p className="page-subtitle">다른 사람들과 마음을 나눠보세요</p>
        </header>

        <div className="chat-intro">
          <div className="intro-card">
            <div className="intro-icon">💬</div>
            <h2 className="intro-title">안전한 익명 대화</h2>
            <p className="intro-description">
              실명이나 개인정보 없이 마음 편히 대화할 수 있습니다.
              AI가 부적절한 내용을 필터링하여 안전한 환경을 만들어드려요.
            </p>
          </div>

          <div className="guidelines">
            <h3 className="guidelines-title">대화 가이드라인</h3>
            <ul className="guidelines-list">
              <li>서로를 존중하며 따뜻한 마음으로 대화해주세요</li>
              <li>개인정보(이름, 연락처 등)는 공유하지 마세요</li>
              <li>욕설이나 부적절한 언어는 자동으로 필터링됩니다</li>
              <li>위기 상황 시 전문가 도움을 받으실 수 있도록 안내드려요</li>
            </ul>
          </div>

          <button
            onClick={startMatching}
            disabled={isMatching || !user}
            className="btn btn-primary w-full"
          >
            {isMatching ? '상대방을 찾고 있어요...' : '대화 시작하기'}
          </button>
        </div>

        <div className="bottom-spacer"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="page-title">익명 채팅</h1>
        <p className="page-subtitle">{chatSession.partnerName}님과 대화 중</p>
      </header>

      <div className="chat-interface">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isOwn ? 'own' : ''}`}>
              <div className="message-avatar">
                {message.isOwn ? user.anonymousName[0] : '친'}
              </div>
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message">
              <div className="message-avatar">친</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span>입력 중</span>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="chat-input"
              rows={1}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="chat-send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="bottom-spacer"></div>
    </div>
  );
}
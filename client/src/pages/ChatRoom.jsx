import React, { useState, useRef, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useLocation } from 'wouter';
import '../styles/Chat.css';

export default function ChatRoom() {
  const { user } = useAnonymousUser();
  const [location, setLocation] = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // URL에서 채팅 정보 추출
  useEffect(() => {
    const pathParts = location.split('/');
    if (pathParts.length >= 4) {
      const chatType = pathParts[2]; // random, ai, etc.
      const chatId = pathParts[3];
      
      let partnerName = '';
      let welcomeMessage = '';
      
      switch (chatType) {
        case 'random':
          partnerName = '익명의 친구';
          welcomeMessage = '안녕하세요! 오늘 기분은 어떠신가요?';
          break;
        case 'ai':
          partnerName = 'AI 상담사';
          welcomeMessage = '안녕하세요! 저는 AI 상담사입니다. 무엇을 도와드릴까요?';
          break;
        default:
          partnerName = '채팅 상대';
          welcomeMessage = '안녕하세요!';
      }
      
      setChatInfo({ 
        type: chatType, 
        id: chatId, 
        partnerName 
      });
      
      // 환영 메시지 추가
      setTimeout(() => {
        setMessages([{
          id: 1,
          senderId: 'partner',
          senderName: partnerName,
          text: welcomeMessage,
          timestamp: new Date(),
          isOwn: false
        }]);
      }, 500);
    }
  }, [location]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatInfo || !user) return;

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
    
    // 채팅 타입별 응답 생성
    setTimeout(() => {
      setIsTyping(false);
      let response = '';
      
      if (chatInfo.type === 'ai') {
        const aiResponses = [
          '그런 감정을 느끼는 것은 자연스러운 일입니다. 더 자세히 말씀해주시겠어요?',
          '힘든 시간을 보내고 계시는군요. 어떤 부분이 가장 어려우신가요?',
          '좋은 생각이네요! 그런 관점으로 바라보시는 것이 도움이 될 것 같습니다.',
          '스트레스를 받으실 때는 깊게 숨을 쉬어보세요. 어떤 상황인지 말씀해주시면 함께 해결방법을 찾아보겠습니다.',
          '감정을 표현해주셔서 감사합니다. 이런 감정을 느낄 때 평소에는 어떻게 대처하시나요?'
        ];
        response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      } else {
        const randomResponses = [
          '그렇군요. 더 자세히 말씀해주세요.',
          '저도 비슷한 경험이 있어요.',
          '힘드시겠어요. 괜찮으시나요?',
          '좋은 생각이네요!',
          '저는 그럴 때 음악을 들어요.',
          '오늘은 어떤 하루였나요?',
          '공감이 가네요.',
          '정말 그런 것 같아요.'
        ];
        response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: 'partner',
        senderName: chatInfo.partnerName,
        text: response,
        timestamp: new Date(),
        isOwn: false
      }]);
    }, 1000 + Math.random() * 2000);
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

  const shouldShowTime = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentTime = new Date(currentMessage.timestamp);
    const previousTime = new Date(previousMessage.timestamp);
    
    // 분이 다르면 시간 표시
    return currentTime.getMinutes() !== previousTime.getMinutes() ||
           currentTime.getHours() !== previousTime.getHours();
  };

  const handleLeaveChat = () => {
    setLocation('/chat');
  };

  if (!chatInfo) {
    return (
      <div className="chat-container">
        <div className="loading">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-room-header">
          <button onClick={handleLeaveChat} className="back-button">
            ← 나가기
          </button>
          <div className="chat-room-info">
            <h1 className="page-title">{chatInfo.partnerName}</h1>
            <p className="page-subtitle">
              {chatInfo.type === 'ai' ? 'AI 상담' : '익명 채팅'}
            </p>
          </div>
        </div>
      </header>

      <div className="chat-interface">
        <div className="chat-messages">
          {messages.map((message, index) => {
            const showTime = shouldShowTime(message, messages[index - 1]);
            return (
              <div key={message.id}>
                <div className={`message ${message.isOwn ? 'own' : ''}`}>
                  <div className="message-avatar">
                    {message.isOwn ? user.anonymousName[0] : (chatInfo.type === 'ai' ? '🤖' : '친')}
                  </div>
                  <div className="message-content">
                    <p className="message-text">{message.text}</p>
                  </div>
                </div>
                {showTime && (
                  <div className={`message-timestamp ${message.isOwn ? 'own' : ''}`}>
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
            );
          })}
          
          {isTyping && (
            <div className="message">
              <div className="message-avatar">
                {chatInfo.type === 'ai' ? '🤖' : '친'}
              </div>
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
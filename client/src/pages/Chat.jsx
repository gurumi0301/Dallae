import React, { useState } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useLocation } from 'wouter';
import '../styles/Chat.css';

export default function Chat() {
  const { user } = useAnonymousUser();
  const [location, setLocation] = useLocation();
  const [isMatching, setIsMatching] = useState({
    random: false,
    ai: false
  });

  const startMatching = async (type) => {
    if (!user) return;
    
    setIsMatching(prev => ({ ...prev, [type]: true }));
    
    try {
      // 매칭 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      // 채팅방 ID 생성
      const chatId = Date.now().toString();
      
      // 채팅방으로 이동
      setLocation(`/chat/${type}/${chatId}`);
    } catch (error) {
      console.error('Chat matching error:', error);
    } finally {
      setIsMatching(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="page-title">채팅</h1>
        <p className="page-subtitle">원하는 대화 방식을 선택해주세요</p>
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

        <div className="chat-options">
          <div className="chat-option-card">
            <div className="option-icon">🎲</div>
            <h3 className="option-title">랜덤 채팅</h3>
            <p className="option-description">
              같은 고민을 가진 익명의 사용자와 1:1 대화를 나눠보세요.
            </p>
            <button
              onClick={() => startMatching('random')}
              disabled={isMatching.random || !user}
              className="btn btn-primary w-full"
            >
              {isMatching.random ? '상대방을 찾고 있어요...' : '랜덤 매칭 시작'}
            </button>
          </div>

          <div className="chat-option-card">
            <div className="option-icon">🤖</div>
            <h3 className="option-title">AI 상담</h3>
            <p className="option-description">
              전문적인 AI 상담사와 대화하며 감정을 정리해보세요.
            </p>
            <button
              onClick={() => startMatching('ai')}
              disabled={isMatching.ai || !user}
              className="btn btn-secondary w-full"
            >
              {isMatching.ai ? 'AI 상담사 연결 중...' : 'AI 상담 시작'}
            </button>
          </div>
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
      </div>

      <div className="bottom-spacer"></div>
    </div>
  );
}
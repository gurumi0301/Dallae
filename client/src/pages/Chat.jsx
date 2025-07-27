import React, { useState } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';

export default function Chat() {
  const { user } = useAnonymousUser();
  const [isMatching, setIsMatching] = useState(false);
  const [chatSession, setChatSession] = useState(null);

  const startMatching = async () => {
    if (!user) return;
    
    setIsMatching(true);
    try {
      const response = await fetch('/api/chat/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (response.ok) {
        const session = await response.json();
        setChatSession(session);
      }
    } catch (error) {
      console.error('Chat matching error:', error);
    } finally {
      setIsMatching(false);
    }
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

        <style>{`
          .chat-container {
            padding: 24px 16px;
            padding-bottom: 100px;
          }

          .chat-header {
            margin-bottom: 32px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--gray-800);
            margin-bottom: 8px;
          }

          .page-subtitle {
            color: var(--gray-600);
            font-size: 16px;
          }

          .chat-intro {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .intro-card {
            background: var(--white);
            border-radius: var(--border-radius-lg);
            padding: 24px;
            text-align: center;
            box-shadow: var(--shadow);
          }

          .intro-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .intro-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--gray-800);
            margin-bottom: 12px;
          }

          .intro-description {
            color: var(--gray-600);
            line-height: 1.6;
          }

          .guidelines {
            background: var(--white);
            border-radius: var(--border-radius-lg);
            padding: 20px;
            box-shadow: var(--shadow);
          }

          .guidelines-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--gray-800);
            margin-bottom: 16px;
          }

          .guidelines-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .guidelines-list li {
            padding: 8px 0;
            color: var(--gray-600);
            position: relative;
            padding-left: 20px;
          }

          .guidelines-list li::before {
            content: '•';
            color: var(--soft-blue);
            font-weight: bold;
            position: absolute;
            left: 0;
          }

          .bottom-spacer {
            height: 80px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-messages">
        <div className="welcome-message">
          <p>채팅방에 입장했습니다. 상대방과 따뜻한 대화를 나눠보세요! 💙</p>
        </div>
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="input"
        />
        <button className="btn btn-primary">전송</button>
      </div>

      <style>{`
        .chat-room {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .welcome-message {
          text-align: center;
          padding: 20px;
          color: var(--gray-600);
          background: var(--gray-50);
          border-radius: var(--border-radius);
          margin-bottom: 16px;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 16px;
          background: var(--white);
          border-top: 1px solid var(--gray-200);
        }

        .chat-input .input {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
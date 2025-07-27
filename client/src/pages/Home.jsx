import { useState } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { Link } from 'wouter';

export default function Home() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');

  const emotions = [
    { name: '행복', emoji: '😊', color: 'peach' },
    { name: '슬픔', emoji: '😢', color: 'soft-blue' },
    { name: '화남', emoji: '😠', color: 'error' },
    { name: '불안', emoji: '😰', color: 'warning' },
    { name: '흥분', emoji: '🤩', color: 'mint' },
    { name: '피곤', emoji: '😴', color: 'gray-500' },
  ];

  const quickActions = [
    {
      title: '감정 기록하기',
      description: '오늘의 감정을 자세히 기록해보세요',
      icon: '📝',
      path: '/diary',
      color: 'mint'
    },
    {
      title: '익명 채팅',
      description: '다른 사람들과 대화해보세요',
      icon: '💬',
      path: '/chat',
      color: 'soft-blue'
    },
    {
      title: '나의 통계',
      description: '감정 패턴을 확인해보세요',
      icon: '📊',
      path: '/stats',
      color: 'peach'
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="greeting">
          <h1 className="greeting-text">
            안녕하세요, <span className="user-name">{user?.anonymousName}</span>님
          </h1>
          <p className="greeting-subtitle">오늘 기분은 어떠신가요?</p>
        </div>
      </header>

      <section className="emotion-section">
        <h2 className="section-title">지금 느끼는 감정</h2>
        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              className={`emotion-btn ${selectedEmotion === emotion.name ? 'selected' : ''}`}
              onClick={() => setSelectedEmotion(emotion.name)}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-name">{emotion.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="actions-section">
        <h2 className="section-title">빠른 실행</h2>
        <div className="action-grid">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.path} className="action-card">
              <div className="action-icon">{action.icon}</div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="bottom-spacer"></div>

      <style jsx>{`
        .home-container {
          padding: 24px 16px;
          padding-bottom: 100px;
        }

        .home-header {
          margin-bottom: 32px;
        }

        .greeting-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 8px;
        }

        .user-name {
          color: var(--soft-blue);
        }

        .greeting-subtitle {
          color: var(--gray-600);
          font-size: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 16px;
        }

        .emotion-section {
          margin-bottom: 32px;
        }

        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .emotion-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          background: var(--white);
          border: 2px solid var(--gray-200);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all 0.2s;
        }

        .emotion-btn:hover {
          border-color: var(--soft-blue);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .emotion-btn.selected {
          border-color: var(--soft-blue);
          background: linear-gradient(135deg, var(--soft-blue-light), var(--mint-light));
          color: var(--white);
        }

        .emotion-emoji {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .emotion-name {
          font-size: 14px;
          font-weight: 500;
        }

        .actions-section {
          margin-bottom: 32px;
        }

        .action-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .action-icon {
          font-size: 24px;
          margin-right: 16px;
          background: var(--gray-100);
          padding: 12px;
          border-radius: var(--border-radius);
        }

        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 4px;
        }

        .action-description {
          font-size: 14px;
          color: var(--gray-600);
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
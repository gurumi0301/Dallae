import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { Link } from 'wouter';

export default function Home() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = Math.min(scrollY / 200, 1); // 200px까지 완전 변환
  const isScrolled = scrollY > 50;

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
      title: '맞춤 추천',
      description: '오늘을 위한 추천을 확인해보세요',
      icon: '⭐',
      path: '/recommendations',
      color: 'peach'
    }
  ];

  return (
    <div className="home-container" style={{
      background: 'white'
    }}>
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      <div className="bg-decoration bg-decoration-2" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      <div className="bg-decoration bg-decoration-3" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      
      <header className={`home-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="greeting" style={{
          padding: `${24 - scrollProgress * 8}px 16px`,
          borderRadius: `${20 - scrollProgress * 6}px`
        }}>
          <div className="greeting-icon" style={{
            fontSize: `${32 - scrollProgress * 8}px`,
            marginBottom: `${16 - scrollProgress * 6}px`
          }}>🌈</div>
          <h1 className="greeting-text" style={{
            fontSize: `${26 - scrollProgress * 6}px`,
            marginBottom: `${8 - scrollProgress * 4}px`
          }}>
            안녕하세요, <span className="user-name">{user?.anonymousName}</span>님
          </h1>
          <p className="greeting-subtitle" style={{
            opacity: 1 - scrollProgress,
            height: scrollProgress > 0.8 ? '0px' : 'auto',
            overflow: 'hidden'
          }}>오늘 기분은 어떠신가요?</p>
        </div>
      </header>

      <section className="emotion-section" style={{
        marginTop: isScrolled ? '80px' : '0px'
      }}>
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
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="bottom-spacer"></div>

      <style>{`
        .home-container {
          padding: 24px 16px;
          padding-bottom: 100px;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          transition: background 0.1s ease;
        }

        /* Background decorative elements */
        .bg-decoration {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .bg-decoration-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, var(--soft-blue-300), var(--mint-300));
          top: -50px;
          right: -50px;
          animation: float 6s ease-in-out infinite;
        }

        .bg-decoration-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, var(--peach-300), var(--soft-blue-300));
          bottom: 200px;
          left: -30px;
          animation: float 8s ease-in-out infinite reverse;
        }

        .bg-decoration-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, var(--mint-300), var(--peach-300));
          top: 40%;
          right: 20px;
          animation: float 7s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .home-header {
          margin-bottom: 40px;
          position: relative;
          z-index: 100;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .home-header.scrolled {
          position: fixed;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: auto;
          max-width: 428px;
          margin-bottom: 0;
          padding: 8px 16px;
          z-index: 1000;
        }

        .greeting {
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 auto;
          max-width: 400px;
        }

        .home-header.scrolled .greeting {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.1);
          max-width: 300px;
        }

        .greeting-icon {
          transition: all 0.2s ease;
          display: inline-block;
        }



        .greeting-text {
          font-weight: 700;
          color: var(--gray-800);
          line-height: 1.2;
          transition: all 0.2s ease;
        }

        .user-name {
          background: linear-gradient(45deg, var(--soft-blue-500), var(--mint-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .greeting-subtitle {
          color: var(--gray-600);
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 20px;
          text-align: center;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: linear-gradient(45deg, var(--soft-blue-400), var(--mint-400));
          border-radius: 2px;
        }

        .emotion-section {
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
          transition: margin-top 0.3s ease;
        }

        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .emotion-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .emotion-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .emotion-btn:hover::before {
          opacity: 1;
        }

        .emotion-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
          border-color: var(--soft-blue-300);
        }

        .emotion-btn.selected {
          background: linear-gradient(135deg, var(--soft-blue-400), var(--mint-400));
          border-color: var(--soft-blue-500);
          color: white;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .emotion-emoji {
          font-size: 28px;
          margin-bottom: 8px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .emotion-name {
          font-size: 14px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .actions-section {
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
        }

        .action-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-card {
          display: flex;
          align-items: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .action-card:hover::before {
          left: 100%;
        }

        .action-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .action-icon {
          font-size: 28px;
          margin-right: 20px;
          padding: 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--soft-blue-100), var(--mint-100));
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          height: 60px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 6px;
        }

        .action-description {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.4;
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { Link } from 'wouter';
import './Home.css';

export default function Home() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-out');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 초기 로딩 페이드인 효과
  useEffect(() => {
    if (user?.anonymousName && isInitialLoad) {
      // 첫 로딩시 1초 후 페이드인
      setTimeout(() => {
        setFadeClass('fade-in');
        setIsInitialLoad(false);
      }, 1000);
    }
  }, [user?.anonymousName, isInitialLoad]);

  // 메시지 순환 효과
  useEffect(() => {
    if (!user?.anonymousName || isInitialLoad) return;
    
    const interval = setInterval(() => {
      setFadeClass('fade-out');
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % 3);
        setFadeClass('fade-in');
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [user?.anonymousName, isInitialLoad]);

  // 위치 기반 날씨 정보 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // 실제 날씨 API 대신 임시 데이터 사용
            setWeather({
              description: '맑음',
              temp: 22,
              location: '서울'
            });
          } catch (error) {
            setWeather({
              description: '날씨 정보 없음',
              temp: '--',
              location: '위치 확인 실패'
            });
          }
        },
        () => {
          setWeather({
            description: '위치 접근 거부',
            temp: '--',
            location: '위치 미확인'
          });
        }
      );
    }
  }, []);

  const scrollProgress = Math.min(scrollY / 150, 1); // 150px까지 완전 변환
  const isScrolled = scrollY > 30;

  const messages = [
    { type: 'greeting', content: `안녕하세요, ${user?.anonymousName}님` },
    { type: 'time', content: `현재 시간 ${currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` },
    { type: 'weather', content: weather ? `${weather.description}, ${weather.temp}°C` : '날씨 정보를 가져오는 중...' }
  ];

  const backgroundImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center'
  ];

  const currentMessage = messages[currentMessageIndex];
  const currentBgImage = backgroundImages[currentMessageIndex];

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
      background: `linear-gradient(135deg, 
        hsl(207, 89%, ${96 + scrollProgress * 4}%) 0%, 
        hsl(125, 38%, ${97 + scrollProgress * 3}%) 50%, 
        hsl(36, 100%, ${98 + scrollProgress * 2}%) 100%)`
    }}>
      {/* Background decorations */}
      <div className="home-bg-decoration home-bg-decoration-1" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      <div className="home-bg-decoration home-bg-decoration-2" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      <div className="home-bg-decoration home-bg-decoration-3" style={{opacity: 0.1 * (1 - scrollProgress)}}></div>
      
      <div className="home-header-spacer" style={{
        height: isScrolled ? '120px' : '0px'
      }}></div>
      
      <header className={`home-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="home-greeting" style={{
          padding: `${24 - scrollProgress * 8}px 16px`,
          borderRadius: `${20 - scrollProgress * 6}px`,
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)), url("${currentBgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}>
          <div className="home-greeting-icon" style={{
            fontSize: `${32 - scrollProgress * 8}px`,
            marginBottom: `${16 - scrollProgress * 8}px`
          }}>🌈</div>
          <div className={`home-greeting-message ${fadeClass}`}>
            <h1 className="home-greeting-text" style={{
              fontSize: `${26 - scrollProgress * 6}px`,
              marginBottom: `${8 - scrollProgress * 8}px`
            }}>
              {currentMessage.type === 'greeting' && (
                <>안녕하세요, <span className="home-user-name">{user?.anonymousName}</span>님</>
              )}
              {currentMessage.type === 'time' && currentMessage.content}
              {currentMessage.type === 'weather' && currentMessage.content}
            </h1>
          </div>
          <p className="home-greeting-subtitle" style={{
            opacity: 1 - scrollProgress * 2,
            height: scrollProgress > 0.5 ? '0px' : 'auto',
            overflow: 'hidden',
            transition: 'none'
          }}>오늘 기분은 어떠신가요?</p>
        </div>
      </header>

      <section className="home-emotion-section">
        <h2 className="home-section-title">지금 느끼는 감정</h2>
        <div className="home-emotion-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              className={`home-emotion-btn ${selectedEmotion === emotion.name ? 'selected' : ''}`}
              onClick={() => setSelectedEmotion(emotion.name)}
            >
              <span className="home-emotion-emoji">{emotion.emoji}</span>
              <span className="home-emotion-name">{emotion.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-actions-section">
        <h2 className="home-section-title">빠른 실행</h2>
        <div className="home-action-grid">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.path} className="home-action-card">
              <div className="home-action-icon">{action.icon}</div>
              <div className="home-action-content">
                <h3 className="home-action-title">{action.title}</h3>
                <p className="home-action-description">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="home-bottom-spacer"></div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { Link } from 'wouter';
import './Home.css';

export default function Home() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeClass, setFadeClass] = useState('fade-in');
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

  // 초기 로딩 후 인사말에서 날짜/시간으로 전환
  useEffect(() => {
    if (user?.anonymousName && isInitialLoad) {
      // 2초 후 페이드아웃 시작
      setTimeout(() => {
        setFadeClass('fade-out');
        // 0.5초 후 내용 변경하고 페이드인
        setTimeout(() => {
          setShowGreeting(false);
          setFadeClass('fade-in');
          setIsInitialLoad(false);
        }, 500);
      }, 2000);
    }
  }, [user?.anonymousName, isInitialLoad]);

  // 메시지는 고정 (순환하지 않음)

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

  const formatDateTime = () => {
    const today = currentTime.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    const time = currentTime.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${today} ${time}`;
  };

  // 고정된 배경 이미지
  const fixedBgImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center';
  
  // 표시할 메시지 결정
  const displayMessage = showGreeting 
    ? `안녕하세요, ${user?.anonymousName}님`
    : `${formatDateTime()}\n${weather ? `${weather.description}, ${weather.temp}°C` : '날씨 정보를 가져오는 중...'}`;

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
          borderRadius: `${20 - scrollProgress * 6}px`
        }}>
          <div className="home-greeting-bg" style={{
            backgroundImage: `url("${fixedBgImage}")`
          }}></div>
          <div className="home-greeting-icon" style={{
            fontSize: `${32 - scrollProgress * 8}px`,
            marginBottom: `${16 - scrollProgress * 8}px`
          }}>🌈</div>
          <div className={`home-greeting-message ${fadeClass}`}>
            <div className="home-greeting-text" style={{
              fontSize: `${26 - scrollProgress * 6}px`,
              marginBottom: `${12 - scrollProgress * 4}px`,
              whiteSpace: 'pre-line'
            }}>
              {displayMessage}
            </div>
          </div>
          <p className="home-greeting-subtitle" style={{
            opacity: 1 - scrollProgress * 2,
            height: scrollProgress > 0.5 ? '0px' : 'auto',
            overflow: 'hidden',
            transition: 'none'
          }}>오늘 기분은 어떠신가요?</p>
        </div>
      </header>

      <div className="home-main-content">
        <div className="home-emotions-and-stats">
          <section>
            <h2 className="home-section-title">감정 체크인</h2>
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
          
          <section>
            <h2 className="home-section-title">오늘의 통계</h2>
            <div className="home-stats-grid">
              <div className="home-stat-card">
                <div className="home-stat-icon">📊</div>
                <div className="home-stat-content">
                  <div className="home-stat-value">7일</div>
                  <div className="home-stat-label">연속 기록</div>
                </div>
              </div>
              <div className="home-stat-card">
                <div className="home-stat-icon">💬</div>
                <div className="home-stat-content">
                  <div className="home-stat-value">3회</div>
                  <div className="home-stat-label">오늘 대화</div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="home-quick-actions">
          <section>
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
        </div>
      </div>

      <div className="home-bottom-spacer"></div>
    </div>
  );
}
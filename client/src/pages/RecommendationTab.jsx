import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useRoute } from 'wouter';
import '../styles/Recommendations.css';

export default function RecommendationTab() {
  const { user } = useAnonymousUser();
  const [match, params] = useRoute('/recommendations/:type');
  const activeTab = params?.type || 'music';
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 첫 진입 시에만 로딩 표시
  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasLoaded(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [activeTab, hasLoaded]);

  const tabs = [
    { id: 'music', name: '음악', emoji: '🎵' },
    { id: 'book', name: '도서', emoji: '📚' },
    { id: 'movie', name: '영화', emoji: '🎬' },
    { id: 'activity', name: '활동', emoji: '🏃‍♂️' },
    { id: 'meditation', name: '명상', emoji: '🧘‍♀️' }
  ];

  const recommendationData = {
    music: [
      {
        id: 1,
        title: '클래식 힐링 플레이리스트',
        description: '마음을 편안하게 해주는 클래식 명곡들',
        duration: '60분',
        difficulty: '쉬움',
        emoji: '🎼'
      },
      {
        id: 2,
        title: '자연 소리와 명상 음악',
        description: '빗소리, 파도소리와 함께하는 명상 음악',
        duration: '30분',
        difficulty: '쉬움',
        emoji: '🌊'
      },
      {
        id: 3,
        title: '업비트 팝송 모음',
        description: '기분을 밝게 만들어주는 신나는 팝송들',
        duration: '45분',
        difficulty: '쉬움',
        emoji: '🎉'
      },
      {
        id: 4,
        title: '집중을 위한 로파이',
        description: '공부나 일할 때 집중력을 높여주는 로파이 음악',
        duration: '90분',
        difficulty: '쉬움',
        emoji: '🎧'
      }
    ],
    book: [
      {
        id: 5,
        title: '마음챙김 명상',
        description: '현재 순간에 집중하는 마음챙김의 기술',
        duration: '200페이지',
        difficulty: '보통',
        emoji: '📖'
      },
      {
        id: 6,
        title: '감정의 치유',
        description: '상처받은 마음을 치유하는 방법들',
        duration: '180페이지',
        difficulty: '쉬움',
        emoji: '💝'
      },
      {
        id: 7,
        title: '긍정의 힘',
        description: '삶을 변화시키는 긍정적 사고의 힘',
        duration: '250페이지',
        difficulty: '쉬움',
        emoji: '✨'
      }
    ],
    movie: [
      {
        id: 8,
        title: '센과 치히로의 행방불명',
        description: '마음을 치유해주는 지브리 애니메이션',
        duration: '125분',
        difficulty: '쉬움',
        emoji: '🏰'
      },
      {
        id: 9,
        title: '인사이드 아웃',
        description: '감정에 대해 이해할 수 있는 픽사 애니메이션',
        duration: '95분',
        difficulty: '쉬움',
        emoji: '🧠'
      },
      {
        id: 10,
        title: '리틀 포레스트',
        description: '자연 속에서 힐링하는 일본 영화',
        duration: '103분',
        difficulty: '쉬움',
        emoji: '🌿'
      }
    ],
    activity: [
      {
        id: 11,
        title: '5분 스트레칭',
        description: '몸과 마음을 이완시키는 간단한 스트레칭',
        duration: '5분',
        difficulty: '쉬움',
        emoji: '🤸‍♀️'
      },
      {
        id: 12,
        title: '산책하기',
        description: '근처 공원이나 동네를 여유롭게 걸어보세요',
        duration: '20분',
        difficulty: '쉬움',
        emoji: '🚶‍♀️'
      },
      {
        id: 13,
        title: '그림 그리기',
        description: '마음속 감정을 자유롭게 표현해보세요',
        duration: '30분',
        difficulty: '보통',
        emoji: '🎨'
      }
    ],
    meditation: [
      {
        id: 14,
        title: '호흡 명상',
        description: '깊은 호흡으로 마음을 진정시키는 명상',
        duration: '10분',
        difficulty: '쉬움',
        emoji: '🫁'
      },
      {
        id: 15,
        title: '바디스캔 명상',
        description: '몸의 감각을 차례로 느껴보는 명상',
        duration: '15분',
        difficulty: '보통',
        emoji: '🧘‍♀️'
      },
      {
        id: 16,
        title: '자애명상',
        description: '자신과 타인에게 사랑을 보내는 명상',
        duration: '20분',
        difficulty: '보통',
        emoji: '💗'
      }
    ]
  };

  const getCurrentRecommendations = () => {
    return recommendationData[activeTab] || [];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '쉬움': return { background: 'linear-gradient(135deg, var(--mint), var(--mint-light))' };
      case '보통': return { background: 'linear-gradient(135deg, var(--soft-blue), var(--soft-blue-light))' };
      case '어려움': return { background: 'linear-gradient(135deg, var(--coral), var(--coral-light))' };
      default: return { background: 'var(--gray-400)' };
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="recommendations-container">
      <header className="recommendations-header">
        <h1 className="page-title">추천</h1>
        <p className="page-subtitle">{currentTab?.name} 추천 콘텐츠</p>
      </header>

      {/* 탭 네비게이션 */}
      <section className="tabs-section">
        <div className="browser-tabs">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`/recommendations/${tab.id}`}
              className={`browser-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-name">{tab.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 추천 콘텐츠 */}
      <section className="recommendations-section">
        <h2 className="section-title">{currentTab?.name} 추천</h2>
        
        {isLoading ? (
          <div className="recommendations-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">{currentTab?.name} 추천을 불러오는 중...</p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {getCurrentRecommendations().map((item) => (
              <div key={item.id} className="recommendation-card">
                <div className="recommendation-header">
                  <span className="recommendation-emoji">{item.emoji}</span>
                  <div className="recommendation-badges">
                    <span 
                      className="difficulty-badge"
                      style={getDifficultyColor(item.difficulty)}
                    >
                      {item.difficulty}
                    </span>
                    <span className="duration-badge">{item.duration}</span>
                  </div>
                </div>
                <h3 className="recommendation-title">{item.title}</h3>
                <p className="recommendation-description">{item.description}</p>
                <button className="btn btn-primary recommendation-button">
                  시작하기
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bottom-spacer"></div>
    </div>
  );
}
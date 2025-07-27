import React, { useState } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';

export default function Recommendations() {
  const { user } = useAnonymousUser();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체', emoji: '🌟' },
    { id: 'meditation', name: '명상', emoji: '🧘‍♀️' },
    { id: 'exercise', name: '운동', emoji: '🏃‍♂️' },
    { id: 'reading', name: '독서', emoji: '📖' },
    { id: 'music', name: '음악', emoji: '🎵' },
    { id: 'nature', name: '자연', emoji: '🌿' }
  ];

  const recommendations = [
    {
      id: 1,
      title: '5분 호흡 명상',
      description: '간단한 호흡법으로 마음을 진정시켜보세요',
      category: 'meditation',
      duration: '5분',
      difficulty: '쉬움',
      emoji: '🌸'
    },
    {
      id: 2,
      title: '감사 일기 쓰기',
      description: '오늘 감사한 세 가지를 적어보세요',
      category: 'reading',
      duration: '10분',
      difficulty: '쉬움',
      emoji: '📝'
    },
    {
      id: 3,
      title: '실내 스트레칭',
      description: '몸과 마음을 이완시키는 가벼운 스트레칭',
      category: 'exercise',
      duration: '15분',
      difficulty: '보통',
      emoji: '🤸‍♀️'
    },
    {
      id: 4,
      title: '클래식 음악 감상',
      description: '마음을 편안하게 해주는 클래식 음악',
      category: 'music',
      duration: '20분',
      difficulty: '쉬움',
      emoji: '🎼'
    },
    {
      id: 5,
      title: '산책하기',
      description: '집 근처를 천천히 걸으며 생각 정리하기',
      category: 'nature',
      duration: '30분',
      difficulty: '쉬움',
      emoji: '🚶‍♀️'
    },
    {
      id: 6,
      title: '마음챙김 식사',
      description: '천천히 음미하며 의식적으로 식사하기',
      category: 'meditation',
      duration: '25분',
      difficulty: '보통',
      emoji: '🍽️'
    }
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '쉬움': return 'bg-mint';
      case '보통': return 'bg-peach';
      case '어려움': return 'bg-soft-blue';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="recommendations-container">
      <header className="recommendations-header">
        <h1 className="page-title">추천</h1>
        <p className="page-subtitle">
          안녕하세요, {user?.anonymousName}님! 오늘을 위한 추천을 확인해보세요
        </p>
      </header>

      <section className="categories-section">
        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-emoji">{category.emoji}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="recommendations-section">
        <h2 className="section-title">
          {selectedCategory === 'all' ? '모든 추천' : categories.find(c => c.id === selectedCategory)?.name + ' 추천'}
        </h2>
        <div className="recommendations-grid">
          {filteredRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="recommendation-card">
              <div className="recommendation-header">
                <span className="recommendation-emoji">{recommendation.emoji}</span>
                <div className="recommendation-badges">
                  <span className={`difficulty-badge ${getDifficultyColor(recommendation.difficulty)}`}>
                    {recommendation.difficulty}
                  </span>
                  <span className="duration-badge">{recommendation.duration}</span>
                </div>
              </div>
              <h3 className="recommendation-title">{recommendation.title}</h3>
              <p className="recommendation-description">{recommendation.description}</p>
              <button className="recommendation-button btn btn-primary">
                시작하기
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-spacer"></div>

      <style>{`
        .recommendations-container {
          padding: 24px 16px;
          padding-bottom: 100px;
        }

        .recommendations-header {
          margin-bottom: 24px;
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
          line-height: 1.5;
        }

        .categories-section {
          margin-bottom: 32px;
        }

        .categories-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 0 8px 0;
          -webkit-overflow-scrolling: touch;
        }

        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: var(--white);
          border: 2px solid var(--gray-200);
          border-radius: var(--border-radius-lg);
          min-width: 80px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .category-btn:hover {
          border-color: var(--soft-blue);
          transform: translateY(-2px);
        }

        .category-btn.active {
          border-color: var(--soft-blue);
          background: linear-gradient(135deg, var(--soft-blue-light), var(--mint-light));
          color: var(--white);
        }

        .category-emoji {
          font-size: 24px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
        }

        .recommendations-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 20px;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .recommendation-card {
          background: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
          transition: all 0.2s;
        }

        .recommendation-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .recommendation-emoji {
          font-size: 32px;
        }

        .recommendation-badges {
          display: flex;
          gap: 8px;
        }

        .difficulty-badge {
          padding: 4px 8px;
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          font-weight: 500;
          color: var(--white);
        }

        .duration-badge {
          padding: 4px 8px;
          background: var(--gray-100);
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          font-weight: 500;
          color: var(--gray-700);
        }

        .recommendation-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 8px;
        }

        .recommendation-description {
          color: var(--gray-600);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .recommendation-button {
          width: 100%;
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
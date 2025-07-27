import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnonymousUser } from '../hooks/useAnonymousUser';

export default function Profile() {
  const { user } = useAnonymousUser();
  const [activeTab, setActiveTab] = useState('personal');

  // Personal stats query
  const { data: personalStats, isLoading: isLoadingPersonal } = useQuery({
    queryKey: [`/api/emotions/stats/${user?.id}`],
    enabled: !!user?.id && activeTab === 'personal',
  });

  // App-wide stats query
  const { data: appStats, isLoading: isLoadingApp } = useQuery({
    queryKey: ['/api/emotions/app-stats'],
    enabled: activeTab === 'app',
  });

  const emotionLabels = {
    happy: '행복',
    sad: '슬픔',
    angry: '화남',
    anxious: '불안',
    excited: '흥분',
    tired: '피곤',
    neutral: '평온'
  };

  const renderPersonalStats = () => {
    if (isLoadingPersonal) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>통계를 불러오고 있어요...</p>
        </div>
      );
    }

    if (!personalStats || personalStats.totalDays === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">아직 기록된 감정이 없어요</h3>
          <p className="empty-description">
            감정 일기를 작성하시면 여기서 통계를 확인하실 수 있어요
          </p>
        </div>
      );
    }

    return (
      <div className="stats-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h4 className="stat-title">기록 일수</h4>
            <div className="stat-value">{personalStats.totalDays}일</div>
          </div>
          <div className="stat-card">
            <h4 className="stat-title">평균 기분</h4>
            <div className="stat-value">{personalStats.averageMood}/10</div>
          </div>
        </div>

        <div className="emotion-distribution-card">
          <h4 className="card-title">감정 분포</h4>
          <div className="emotion-bars">
            {Object.entries(personalStats.emotionDistribution).map(([emotion, count]) => (
              <div key={emotion} className="emotion-bar-item">
                <div className="emotion-bar-header">
                  <span className="emotion-label">{emotionLabels[emotion] || emotion}</span>
                  <span className="emotion-count">{count}번</span>
                </div>
                <div className="emotion-bar">
                  <div 
                    className="emotion-bar-fill"
                    style={{ width: `${(count / personalStats.totalDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAppStats = () => {
    if (isLoadingApp) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>앱 통계를 불러오고 있어요...</p>
        </div>
      );
    }

    // Mock app stats for demonstration
    const mockAppStats = {
      totalUsers: 1247,
      totalEntries: 8934,
      averageAppMood: 6.8,
      todayActiveUsers: 89,
      mostCommonEmotion: 'happy'
    };

    return (
      <div className="stats-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h4 className="stat-title">전체 사용자</h4>
            <div className="stat-value">{mockAppStats.totalUsers.toLocaleString()}명</div>
          </div>
          <div className="stat-card">
            <h4 className="stat-title">오늘 활성 사용자</h4>
            <div className="stat-value">{mockAppStats.todayActiveUsers}명</div>
          </div>
          <div className="stat-card">
            <h4 className="stat-title">총 감정 기록</h4>
            <div className="stat-value">{mockAppStats.totalEntries.toLocaleString()}개</div>
          </div>
          <div className="stat-card">
            <h4 className="stat-title">평균 기분</h4>
            <div className="stat-value">{mockAppStats.averageAppMood}/10</div>
          </div>
        </div>

        <div className="insight-card">
          <h4 className="card-title">커뮤니티 인사이트</h4>
          <p className="insight-text">
            오늘 가장 많은 사용자들이 선택한 감정은 "{emotionLabels[mockAppStats.mostCommonEmotion]}"이에요. 
            여러분과 같은 마음을 가진 분들이 많이 계시니 혼자라고 느끼지 마세요! 💙
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="account-info">
          <div className="avatar">
            <span className="avatar-emoji">🐾</span>
          </div>
          <div className="account-details">
            <h1 className="account-name">{user?.anonymousName || '익명 사용자'}</h1>
            <p className="account-subtitle">마음담기와 함께한 지 {Math.floor(Math.random() * 30) + 1}일째</p>
          </div>
        </div>
      </header>

      <nav className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          내 통계
        </button>
        <button
          className={`tab-button ${activeTab === 'app' ? 'active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          앱 전체 통계
        </button>
      </nav>

      <main className="profile-content">
        {activeTab === 'personal' ? renderPersonalStats() : renderAppStats()}
      </main>

      <div className="bottom-spacer"></div>

      <style>{`
        .profile-container {
          padding: 24px 16px;
          padding-bottom: 100px;
        }

        .profile-header {
          margin-bottom: 32px;
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--white);
          padding: 20px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .avatar {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--soft-blue), var(--mint));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-emoji {
          font-size: 32px;
        }

        .account-details {
          flex: 1;
        }

        .account-name {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 4px;
        }

        .account-subtitle {
          color: var(--gray-600);
          font-size: 14px;
        }

        .profile-tabs {
          display: flex;
          background: var(--gray-100);
          border-radius: var(--border-radius);
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-button {
          flex: 1;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: var(--border-radius-sm);
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: var(--white);
          color: var(--soft-blue);
          box-shadow: var(--shadow-sm);
        }

        .profile-content {
          min-height: 400px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 12px;
        }

        .empty-description {
          color: var(--gray-600);
          line-height: 1.6;
        }

        .stats-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow);
        }

        .stat-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--soft-blue);
        }

        .emotion-distribution-card {
          background: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 16px;
        }

        .emotion-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .emotion-bar-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .emotion-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .emotion-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
        }

        .emotion-count {
          font-size: 12px;
          color: var(--gray-500);
        }

        .emotion-bar {
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          overflow: hidden;
        }

        .emotion-bar-fill {
          height: 100%;
          background: linear-gradient(135deg, var(--soft-blue), var(--mint));
          transition: width 0.3s ease;
        }

        .insight-card {
          background: linear-gradient(135deg, var(--soft-blue-light), var(--mint-light));
          border-radius: var(--border-radius-lg);
          padding: 20px;
          color: var(--white);
        }

        .insight-card .card-title {
          color: var(--white);
        }

        .insight-text {
          line-height: 1.6;
          color: var(--white);
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
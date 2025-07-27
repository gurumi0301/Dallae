import { useQuery } from '@tanstack/react-query';
import { useAnonymousUser } from '../hooks/useAnonymousUser';

export default function Stats() {
  const { user } = useAnonymousUser();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: [`/api/emotions/stats/${user?.id}`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="stats-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>통계를 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalDays === 0) {
    return (
      <div className="stats-container">
        <header className="stats-header">
          <h1 className="page-title">나의 통계</h1>
          <p className="page-subtitle">감정 패턴을 확인해보세요</p>
        </header>

        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2 className="empty-title">아직 기록된 감정이 없어요</h2>
          <p className="empty-description">
            감정 일기를 작성하시면 여기서 통계를 확인하실 수 있어요
          </p>
        </div>
      </div>
    );
  }

  const emotionColors = {
    happy: 'peach',
    sad: 'soft-blue',
    angry: 'error',
    anxious: 'warning',
    excited: 'mint',
    tired: 'gray-500',
    neutral: 'gray-400'
  };

  const emotionLabels = {
    happy: '행복',
    sad: '슬픔',
    angry: '화남',
    anxious: '불안',
    excited: '흥분',
    tired: '피곤',
    neutral: '평온'
  };

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h1 className="page-title">나의 통계</h1>
        <p className="page-subtitle">지난 {stats.totalDays}일간의 감정 기록</p>
      </header>

      <div className="stats-grid">
        {/* 평균 기분 */}
        <div className="stat-card">
          <h3 className="stat-title">평균 기분</h3>
          <div className="stat-value-large">{stats.averageMood}/10</div>
          <p className="stat-description">
            {stats.averageMood >= 7 ? '좋은' : stats.averageMood >= 5 ? '보통' : '힘든'} 시간을 보내고 계시네요
          </p>
        </div>

        {/* 총 기록 일수 */}
        <div className="stat-card">
          <h3 className="stat-title">기록 일수</h3>
          <div className="stat-value-large">{stats.totalDays}일</div>
          <p className="stat-description">꾸준히 기록하고 계시네요!</p>
        </div>

        {/* 감정 분포 */}
        <div className="stat-card full-width">
          <h3 className="stat-title">감정 분포</h3>
          <div className="emotion-distribution">
            {Object.entries(stats.emotionDistribution).map(([emotion, count]) => (
              <div key={emotion} className="emotion-bar-container">
                <div className="emotion-label-container">
                  <span className="emotion-label">{emotionLabels[emotion] || emotion}</span>
                  <span className="emotion-count">{count}번</span>
                </div>
                <div className="emotion-bar">
                  <div 
                    className={`emotion-bar-fill emotion-${emotionColors[emotion] || 'gray'}`}
                    style={{ width: `${(count / stats.totalDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주간 기분 변화 */}
        {stats.weeklyMoodData.length > 0 && (
          <div className="stat-card full-width">
            <h3 className="stat-title">최근 7일 기분 변화</h3>
            <div className="mood-chart">
              {stats.weeklyMoodData.map((day, index) => (
                <div key={index} className="mood-day">
                  <div className="mood-bar-container">
                    <div 
                      className="mood-bar"
                      style={{ height: `${(day.mood / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="mood-day-label">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 인사이트 */}
        <div className="stat-card full-width insight-card">
          <h3 className="stat-title">인사이트</h3>
          <p className="insight-text">{stats.insights}</p>
        </div>
      </div>

      <div className="bottom-spacer"></div>

      <style jsx>{`
        .stats-container {
          padding: 24px 16px;
          padding-bottom: 100px;
        }

        .stats-header {
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

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
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
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 12px;
        }

        .empty-description {
          color: var(--gray-600);
          line-height: 1.6;
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
          box-shadow: var(--shadow);
        }

        .stat-card.full-width {
          grid-column: 1 / -1;
        }

        .stat-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 12px;
        }

        .stat-value-large {
          font-size: 32px;
          font-weight: 700;
          color: var(--soft-blue);
          margin-bottom: 8px;
        }

        .stat-description {
          font-size: 14px;
          color: var(--gray-600);
        }

        .emotion-distribution {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .emotion-bar-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .emotion-label-container {
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
          transition: width 0.3s ease;
        }

        .emotion-peach { background: var(--peach); }
        .emotion-soft-blue { background: var(--soft-blue); }
        .emotion-mint { background: var(--mint); }
        .emotion-error { background: var(--error); }
        .emotion-warning { background: var(--warning); }
        .emotion-gray { background: var(--gray-400); }

        .mood-chart {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 120px;
        }

        .mood-day {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mood-bar-container {
          height: 80px;
          width: 100%;
          display: flex;
          align-items: end;
        }

        .mood-bar {
          width: 100%;
          background: linear-gradient(135deg, var(--soft-blue), var(--mint));
          border-radius: 4px 4px 0 0;
          min-height: 4px;
        }

        .mood-day-label {
          font-size: 12px;
          color: var(--gray-600);
          margin-top: 8px;
        }

        .insight-card {
          background: linear-gradient(135deg, var(--soft-blue-light), var(--mint-light));
          color: var(--white);
        }

        .insight-card .stat-title {
          color: var(--white);
        }

        .insight-text {
          color: var(--white);
          line-height: 1.6;
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
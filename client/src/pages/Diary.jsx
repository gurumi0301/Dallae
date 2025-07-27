import { useState } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export default function Diary() {
  const { user } = useAnonymousUser();
  const queryClient = useQueryClient();
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [content, setContent] = useState('');
  const [gratefulFor, setGratefulFor] = useState('');
  const [tomorrowGoal, setTomorrowGoal] = useState('');

  const emotions = [
    { name: 'happy', label: '행복', emoji: '😊', color: 'peach' },
    { name: 'sad', label: '슬픔', emoji: '😢', color: 'soft-blue' },
    { name: 'angry', label: '화남', emoji: '😠', color: 'error' },
    { name: 'anxious', label: '불안', emoji: '😰', color: 'warning' },
    { name: 'excited', label: '흥분', emoji: '🤩', color: 'mint' },
    { name: 'tired', label: '피곤', emoji: '😴', color: 'gray-500' },
    { name: 'neutral', label: '평온', emoji: '😐', color: 'gray-400' },
  ];

  const saveEntry = useMutation({
    mutationFn: async (entryData) => {
      return await apiRequest('/api/emotions/entry', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });
    },
    onSuccess: () => {
      // Reset form
      setEmotion('');
      setIntensity(5);
      setContent('');
      setGratefulFor('');
      setTomorrowGoal('');
      
      // Invalidate related queries
      queryClient.invalidateQueries(['/api/emotions/entries']);
      queryClient.invalidateQueries(['/api/emotions/stats']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emotion || !user) return;

    saveEntry.mutate({
      userId: user.id,
      emotion,
      intensity,
      content: content.trim() || null,
      gratefulFor: gratefulFor.trim() || null,
      tomorrowGoal: tomorrowGoal.trim() || null,
    });
  };

  const intensityLabels = {
    1: '매우 약함',
    2: '약함',
    3: '조금 약함',
    4: '보통 이하',
    5: '보통',
    6: '조금 강함',
    7: '강함',
    8: '매우 강함',
    9: '극도로 강함',
    10: '최고조'
  };

  return (
    <div className="diary-container">
      <header className="diary-header">
        <h1 className="page-title">감정 일기</h1>
        <p className="page-subtitle">오늘의 감정을 기록해보세요</p>
      </header>

      <form onSubmit={handleSubmit} className="diary-form">
        <div className="form-section">
          <h2 className="section-title">지금 느끼는 감정</h2>
          <div className="emotion-grid">
            {emotions.map((emotionOption) => (
              <button
                key={emotionOption.name}
                type="button"
                className={`emotion-btn ${emotion === emotionOption.name ? 'selected' : ''}`}
                onClick={() => setEmotion(emotionOption.name)}
              >
                <span className="emotion-emoji">{emotionOption.emoji}</span>
                <span className="emotion-name">{emotionOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {emotion && (
          <>
            <div className="form-section">
              <h2 className="section-title">감정의 강도</h2>
              <div className="intensity-section">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="intensity-slider"
                />
                <div className="intensity-display">
                  <span className="intensity-value">{intensity}</span>
                  <span className="intensity-label">{intensityLabels[intensity]}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">상세 내용 (선택사항)</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="어떤 일이 있었나요? 무엇을 느끼셨나요?"
                className="textarea"
                rows="4"
              />
            </div>

            <div className="form-section">
              <h2 className="section-title">감사한 일 (선택사항)</h2>
              <textarea
                value={gratefulFor}
                onChange={(e) => setGratefulFor(e.target.value)}
                placeholder="오늘 감사했던 일이 있다면 적어보세요"
                className="textarea"
                rows="3"
              />
            </div>

            <div className="form-section">
              <h2 className="section-title">내일의 목표 (선택사항)</h2>
              <textarea
                value={tomorrowGoal}
                onChange={(e) => setTomorrowGoal(e.target.value)}
                placeholder="내일 하고 싶은 일이나 목표가 있다면 적어보세요"
                className="textarea"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={saveEntry.isPending}
              className="btn btn-primary w-full"
            >
              {saveEntry.isPending ? '저장 중...' : '감정 기록 저장'}
            </button>
          </>
        )}
      </form>

      <div className="bottom-spacer"></div>

      <style>{`
        .diary-container {
          padding: 24px 16px;
          padding-bottom: 100px;
        }

        .diary-header {
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

        .diary-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          background: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 16px;
        }

        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .emotion-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          background: var(--gray-50);
          border: 2px solid var(--gray-200);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s;
        }

        .emotion-btn:hover {
          border-color: var(--soft-blue);
          transform: translateY(-1px);
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

        .intensity-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .intensity-slider {
          width: 100%;
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          outline: none;
          appearance: none;
        }

        .intensity-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: var(--soft-blue);
          border-radius: 50%;
          cursor: pointer;
        }

        .intensity-display {
          text-align: center;
        }

        .intensity-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--soft-blue);
          margin-right: 8px;
        }

        .intensity-label {
          font-size: 16px;
          color: var(--gray-600);
        }

        .bottom-spacer {
          height: 80px;
        }
      `}</style>
    </div>
  );
}
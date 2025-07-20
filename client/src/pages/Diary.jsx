import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnonymousUser } from '../hooks/useAnonymousUser.js';
import { createDiaryEntry, getDiaryEntries } from '../lib/api.js';
import EmotionSelector from '../components/EmotionSelector.jsx';

export default function Diary() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [content, setContent] = useState('');
  const [gratefulFor, setGratefulFor] = useState('');
  const [tomorrowGoal, setTomorrowGoal] = useState('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Diary entries query
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['diary-entries', user?.id],
    queryFn: () => getDiaryEntries(user.id),
    enabled: !!user,
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: createDiaryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['diary-entries', user?.id]);
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Failed to create diary entry:', error);
    },
  });

  const resetForm = () => {
    setSelectedEmotion('');
    setIntensity(5);
    setContent('');
    setGratefulFor('');
    setTomorrowGoal('');
  };

  const handleSubmit = () => {
    if (!selectedEmotion || !user) return;

    createEntryMutation.mutate({
      userId: user.id,
      emotion: selectedEmotion,
      intensity,
      content: content.trim() || null,
      gratefulFor: gratefulFor.trim() || null,
      tomorrowGoal: tomorrowGoal.trim() || null,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤗',
      tired: '😴',
    };
    return emojis[emotion] || '😐';
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return 'text-red-500';
    if (intensity <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">감정 일기</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? '취소' : '새 일기'}
          </button>
        </div>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="space-y-6">
            {/* Emotion Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                오늘의 주요 감정
              </h3>
              <EmotionSelector
                onEmotionSelect={setSelectedEmotion}
                selectedEmotion={selectedEmotion}
                size="large"
              />
            </div>

            {/* Intensity */}
            {selectedEmotion && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  감정의 강도 ({intensity}/10)
                </h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>약함</span>
                  <span>보통</span>
                  <span>강함</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                오늘 있었던 일
              </h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루 어떤 일이 있었나요? 자유롭게 기록해보세요..."
                className="form-textarea"
                rows="4"
              />
            </div>

            {/* Gratitude */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                감사한 일
              </h3>
              <input
                type="text"
                value={gratefulFor}
                onChange={(e) => setGratefulFor(e.target.value)}
                placeholder="오늘 감사했던 일이나 사람이 있나요?"
                className="form-input"
              />
            </div>

            {/* Tomorrow Goal */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                내일의 목표
              </h3>
              <input
                type="text"
                value={tomorrowGoal}
                onChange={(e) => setTomorrowGoal(e.target.value)}
                placeholder="내일 해보고 싶은 일이나 목표가 있나요?"
                className="form-input"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedEmotion || createEntryMutation.isPending}
              className="btn btn-primary w-full"
            >
              {createEntryMutation.isPending ? '저장 중...' : '일기 저장'}
            </button>
          </div>
        </div>
      )}

      {/* Diary Entries */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-800 mb-4">지난 일기들</h2>
        
        {isLoading ? (
          <div className="text-center text-gray-500">일기를 불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p>아직 작성된 일기가 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 감정 일기를 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card">
                {/* Entry Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getEmotionEmoji(entry.emotion)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {entry.emotion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getIntensityColor(entry.intensity)}`}>
                    강도 {entry.intensity}/10
                  </div>
                </div>

                {/* Entry Content */}
                {entry.content && (
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                )}

                {/* Gratitude and Goal */}
                <div className="space-y-2">
                  {entry.gratefulFor && (
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-500 text-sm">💛</span>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">감사한 일:</span> {entry.gratefulFor}
                      </p>
                    </div>
                  )}
                  {entry.tomorrowGoal && (
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 text-sm">🎯</span>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">다음 목표:</span> {entry.tomorrowGoal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnonymousUser } from '../hooks/useAnonymousUser.js';
import { getUserStats } from '../lib/api.js';

export default function Stats() {
  const { user } = useAnonymousUser();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user.id),
    enabled: !!user,
  });

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤗',
      tired: '😴',
      good: '😊',
      worried: '😰',
      neutral: '😐',
    };
    return emojis[emotion] || '😐';
  };

  const getMoodColor = (mood) => {
    if (mood <= 3) return 'bg-red-100 text-red-600';
    if (mood <= 6) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStreakMessage = (days) => {
    if (days === 0) return '오늘부터 시작해보세요!';
    if (days === 1) return '좋은 시작이에요!';
    if (days <= 7) return '꾸준히 하고 계시네요!';
    if (days <= 30) return '정말 대단해요!';
    return '놀라운 성취입니다!';
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

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="p-6 border-b bg-white">
          <h1 className="text-xl font-bold text-gray-800">감정 통계</h1>
        </div>
        <div className="flex items-center justify-center mt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-soft-blue-200 border-t-soft-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">통계를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-800">감정 통계</h1>
        <p className="text-gray-600 text-sm mt-1">
          {user.anonymousName}님의 감정 기록
        </p>
      </div>

      {stats?.totalDays === 0 ? (
        <div className="p-6">
          <div className="text-center mt-20">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              아직 기록이 없어요
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              감정 일기를 작성하시면 통계를 확인할 수 있어요
            </p>
            <p className="text-gray-500 text-xs">
              {stats.insights}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-soft-blue-600 mb-1">
                {stats.totalDays}
              </div>
              <p className="text-sm text-gray-600">기록된 일수</p>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-mint-600 mb-1">
                {stats.averageMood}
              </div>
              <p className="text-sm text-gray-600">평균 기분</p>
            </div>
          </div>

          {/* Weekly Mood Chart */}
          {stats.weeklyMoodData?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">주간 기분 변화</h3>
              <div className="space-y-3">
                {stats.weeklyMoodData.map((day, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 text-sm text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                      <div
                        className="h-full rounded-full soft-blue-400"
                        style={{ width: `${(day.mood / 10) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {day.mood}/10
                      </span>
                    </div>
                    <span className="text-lg">
                      {getEmotionEmoji(day.emotion)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotion Distribution */}
          {Object.keys(stats.emotionDistribution || {}).length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">감정 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.emotionDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([emotion, count]) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {getEmotionEmoji(emotion)}
                        </span>
                        <span className="text-sm text-gray-700 capitalize">
                          {emotion}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-full rounded-full soft-blue-400"
                            style={{ 
                              width: `${(count / stats.totalDays) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {count}일
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Usage Statistics */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">활동 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {stats.usageStats?.diaryEntries || 0}
                </div>
                <p className="text-xs text-gray-600">일기 작성</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {stats.usageStats?.streakDays || 0}
                </div>
                <p className="text-xs text-gray-600">연속 기록</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 soft-blue-50 rounded-lg text-center">
              <p className="text-sm text-soft-blue-700">
                {getStreakMessage(stats.usageStats?.streakDays || 0)}
              </p>
            </div>
          </div>

          {/* Insights */}
          {stats.insights && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">인사이트</h3>
              <div className="p-4 peach-50 rounded-lg">
                <p className="text-sm text-gray-700">{stats.insights}</p>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="card text-center">
            <div className="w-12 h-12 mx-auto mb-3 soft-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              감정을 기록하는 것만으로도 자기 인식이 향상됩니다.
            </p>
            <p className="text-xs text-gray-500">
              꾸준한 기록으로 더 나은 마음 건강을 만들어가세요 ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
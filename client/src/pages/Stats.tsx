import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";
import { statsApi } from "@/lib/api";
import type { EmotionStats } from "@/lib/api";

export default function Stats() {
  const { user } = useAnonymousUser();

  const { data: stats, isLoading } = useQuery<EmotionStats>({
    queryKey: ['/api/stats', user?.id],
    enabled: !!user?.id,
  });

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      happy: 'from-green-400 to-green-500',
      sad: 'from-red-400 to-red-500',
      angry: 'from-orange-400 to-orange-500',
      anxious: 'from-yellow-400 to-orange-500',
      excited: 'from-purple-400 to-purple-500',
      tired: 'from-gray-400 to-gray-500',
      neutral: 'from-blue-400 to-blue-500',
    };
    return colorMap[emotion] || 'from-blue-400 to-blue-500';
  };

  const getEmotionLabel = (emotion: string) => {
    const labelMap: Record<string, string> = {
      happy: '기쁨',
      sad: '슬픔',
      angry: '분노',
      anxious: '불안',
      excited: '설렘',
      tired: '피곤',
      neutral: '평온',
    };
    return labelMap[emotion] || emotion;
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤗',
      tired: '😴',
      neutral: '😐',
    };
    return emojiMap[emotion] || '😐';
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 flex items-center space-x-4">
        <Link href="/">
          <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Link>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">감정 통계</h3>
          <p className="text-gray-600 text-sm">내 마음의 변화를 확인해보세요</p>
        </div>
      </div>
      
      {/* Stats Content */}
      <div className="p-6 space-y-6 pb-24 overflow-y-auto mobile-scroll" style={{ height: "calc(100vh - 88px)" }}>
        {stats ? (
          <>
            {/* Weekly Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4">이번 주 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{stats.totalDays}</div>
                  <p className="text-gray-600 text-sm">기록한 날</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.averageMood.toFixed(1)}</div>
                  <p className="text-gray-600 text-sm">평균 기분 점수</p>
                </div>
              </div>
            </div>
            
            {/* Emotion Distribution */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">감정 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.emotionDistribution).map(([emotion, percentage]) => (
                  <div key={emotion} className="flex items-center space-x-3">
                    <span className="text-xl">{getEmotionEmoji(emotion)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 text-sm">{getEmotionLabel(emotion)}</span>
                        <span className="text-gray-600 text-sm">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getEmotionColor(emotion)} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Daily Mood Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">일주일 기분 변화</h3>
              <div className="flex items-end justify-between h-32 bg-gray-50 rounded-xl p-4">
                {stats.weeklyMoodData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div 
                      className={`w-6 bg-gradient-to-t ${getEmotionColor(day.emotion)} rounded-t`}
                      style={{ height: `${(day.mood / 10) * 80}px` }}
                    />
                    <span className="text-xs text-gray-600">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Usage Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">앱 사용 통계</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{stats.usageStats.totalChats}</div>
                  <p className="text-gray-600 text-sm">총 대화 수</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{stats.usageStats.diaryEntries}</div>
                  <p className="text-gray-600 text-sm">일기 작성</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{stats.usageStats.aiComforts}</div>
                  <p className="text-gray-600 text-sm">AI 위로</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{stats.usageStats.streakDays}</div>
                  <p className="text-gray-600 text-sm">연속 사용일</p>
                </div>
              </div>
            </div>
            
            {/* Insights */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <h3 className="font-semibold text-gray-800">이번 주 인사이트</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {stats.insights || "감정 기록을 더 많이 해보시면 개인화된 인사이트를 제공해드릴게요! 🌟"}
              </p>
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">아직 통계가 없어요</h3>
            <p className="text-gray-600 mb-6">감정 일기를 작성하거나 대화를 시작해보세요!</p>
            
            <div className="space-y-3">
              <Link href="/diary">
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold py-3 rounded-xl">
                  감정 일기 작성하기
                </button>
              </Link>
              <Link href="/chat">
                <button className="w-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold py-3 rounded-xl">
                  대화 시작하기
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

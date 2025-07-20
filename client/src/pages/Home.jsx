import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAnonymousUser } from '../hooks/useAnonymousUser.js';
import { analyzeEmotion } from '../lib/api.js';
import EmotionSelector from '../components/EmotionSelector.jsx';

export default function Home() {
  const { user } = useAnonymousUser();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [emotionText, setEmotionText] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  const emotionMutation = useMutation({
    mutationFn: ({ content, userId }) => analyzeEmotion(content, userId),
    onSuccess: (data) => {
      setAiResponse(data);
    },
    onError: (error) => {
      console.error('Emotion analysis failed:', error);
    },
  });

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setAiResponse(null);
  };

  const handleAnalyzeEmotion = () => {
    if (!emotionText.trim()) return;
    
    emotionMutation.mutate({
      content: emotionText,
      userId: user?.id,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getEmotionMessage = (emotion) => {
    const messages = {
      sad: '힘든 하루를 보내고 계시는군요. 괜찮아요, 함께 이야기해봐요.',
      worried: '걱정이 많으신 것 같아요. 무엇이든 나누어 주세요.',
      neutral: '평범한 하루이시군요. 소소한 일상도 소중해요.',
      good: '기분이 좋으시군요! 좋은 에너지가 느껴져요.',
      happy: '정말 행복해 보이세요! 기쁨을 함께 나누어 주세요.',
    };
    return messages[emotion] || '오늘 하루는 어떠세요?';
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 text-center soft-blue-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {getGreeting()}
        </h1>
        {user && (
          <p className="text-gray-600">
            <span className="font-medium">{user.anonymousName}</span>님
          </p>
        )}
      </div>

      {/* Emotion Selection */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          지금 기분이 어떠세요?
        </h2>
        <EmotionSelector
          onEmotionSelect={handleEmotionSelect}
          selectedEmotion={selectedEmotion}
          size="small"
        />
        {selectedEmotion && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-700 text-center">
              {getEmotionMessage(selectedEmotion)}
            </p>
          </div>
        )}
      </div>

      {/* Emotion Text Input */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          더 자세히 이야기해주세요
        </h3>
        <textarea
          value={emotionText}
          onChange={(e) => setEmotionText(e.target.value)}
          placeholder="오늘 어떤 일이 있었나요? 마음 편히 이야기해주세요..."
          className="form-textarea"
          rows="4"
        />
        <button
          onClick={handleAnalyzeEmotion}
          disabled={!emotionText.trim() || emotionMutation.isPending}
          className="btn btn-primary w-full mt-3"
        >
          {emotionMutation.isPending ? 'AI가 분석 중...' : 'AI 위로받기'}
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="px-6 mb-8">
          <div className="card">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 mint-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-mint-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 mb-1">AI 위로</p>
                <p className="text-gray-700">{aiResponse.comfortMessage}</p>
                <div className="mt-2 text-xs text-gray-500">
                  감지된 감정: {aiResponse.emotion} (신뢰도: {aiResponse.confidence}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">빠른 이동</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/chat">
            <div className="card text-center">
              <div className="w-12 h-12 soft-blue-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">익명 대화</h4>
              <p className="text-xs text-gray-600">비슷한 상황의 사람과 대화</p>
            </div>
          </Link>

          <Link href="/diary">
            <div className="card text-center">
              <div className="w-12 h-12 mint-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">감정 일기</h4>
              <p className="text-xs text-gray-600">하루의 감정을 기록</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
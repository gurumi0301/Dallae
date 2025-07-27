import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";
import { diaryApi } from "@/lib/api";
import EmotionSelector from "@/components/EmotionSelector";
import { useToast } from "@/hooks/use-toast";
import type { EmotionEntry } from "@shared/schema";

export default function Diary() {
  const { user } = useAnonymousUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [intensity, setIntensity] = useState(5);
  const [content, setContent] = useState("");
  const [gratefulFor, setGratefulFor] = useState("");
  const [tomorrowGoal, setTomorrowGoal] = useState("");

  // Get user's diary entries
  const { data: entries = [] } = useQuery<EmotionEntry[]>({
    queryKey: ['/api/diary', user?.id],
    enabled: !!user?.id,
  });

  // Create diary entry
  const createEntry = useMutation({
    mutationFn: () => diaryApi.create({
      userId: user?.id || 0,
      emotion: selectedEmotion,
      intensity,
      content,
      gratefulFor,
      tomorrowGoal,
    }),
    onSuccess: () => {
      toast({
        title: "일기 저장 완료",
        description: "오늘의 감정이 성공적으로 기록되었습니다.",
      });
      // Reset form
      setSelectedEmotion("");
      setIntensity(5);
      setContent("");
      setGratefulFor("");
      setTomorrowGoal("");
      // Refresh entries
      queryClient.invalidateQueries({ queryKey: ['/api/diary', user?.id] });
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "일기를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedEmotion) {
      toast({
        title: "감정을 선택해주세요",
        description: "오늘의 주된 감정을 선택해야 합니다.",
        variant: "destructive",
      });
      return;
    }
    createEntry.mutate();
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = days[now.getDay()];
    
    return {
      formatted: `${year}년 ${month}월 ${date}일`,
      dayName,
    };
  };

  const currentDate = getCurrentDate();

  const getEmotionLabel = (emotion: string) => {
    const emotionMap: Record<string, string> = {
      happy: '기쁨',
      sad: '슬픔',
      angry: '분노',
      anxious: '불안',
      excited: '설렘',
      tired: '피곤',
    };
    return emotionMap[emotion] || emotion;
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤗',
      tired: '😴',
    };
    return emojiMap[emotion] || '😐';
  };

  return (
    <div className="absolute inset-0 bg-white">
      {/* Diary Header */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 flex items-center space-x-4">
        <Link href="/">
          <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Link>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">감정 일기</h3>
          <p className="text-gray-600 text-sm">오늘의 마음을 기록해보세요</p>
        </div>
      </div>
      
      {/* Diary Content */}
      <div className="p-6 space-y-6 pb-24 overflow-y-auto mobile-scroll" style={{ height: "calc(100vh - 88px)" }}>
        {/* Today's Date */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{currentDate.formatted}</h2>
          <p className="text-gray-600">{currentDate.dayName}</p>
        </div>
        
        {/* Emotion Selection */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">오늘의 주된 감정</h3>
          <EmotionSelector 
            onEmotionSelect={setSelectedEmotion}
            selectedEmotion={selectedEmotion}
            size="large"
          />
        </div>
        
        {/* Emotion Intensity */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">감정의 정도</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>약함</span>
              <span>강함</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <div className="flex justify-center">
              <span className="text-2xl font-bold text-blue-500">{intensity}</span>
            </div>
          </div>
        </div>
        
        {/* Diary Entry */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">오늘 있었던 일</h3>
          <textarea 
            placeholder="오늘 하루는 어떠셨나요? 자유롭게 마음을 표현해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 bg-white rounded-xl p-4 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
          />
        </div>
        
        {/* Quick Questions */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">오늘의 질문</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4">
              <p className="text-gray-700 text-sm mb-2">가장 감사했던 순간은?</p>
              <input
                type="text"
                placeholder="답변을 입력해주세요"
                value={gratefulFor}
                onChange={(e) => setGratefulFor(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
              />
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-gray-700 text-sm mb-2">내일은 무엇을 하고 싶나요?</p>
              <input
                type="text"
                placeholder="답변을 입력해주세요"
                value={tomorrowGoal}
                onChange={(e) => setTomorrowGoal(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={createEntry.isPending}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createEntry.isPending ? "저장 중..." : "일기 저장하기"}
        </button>
        
        {/* Previous Entries */}
        {entries.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">이전 기록</h3>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl p-4 flex items-center space-x-3">
                  <span className="text-2xl">{getEmotionEmoji(entry.emotion)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">
                      {new Date(entry.createdAt).toLocaleDateString('ko-KR')} - {getEmotionLabel(entry.emotion)}
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-1">
                      {entry.content || "감정만 기록됨"}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

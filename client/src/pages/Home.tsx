import { useState } from "react";
import { Link } from "wouter";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";
import EmotionSelector from "@/components/EmotionSelector";
import { useMutation } from "@tanstack/react-query";
import { emotionApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAnonymousUser();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");

  const analyzeEmotion = useMutation({
    mutationFn: (emotion: string) => emotionApi.analyze(`오늘 기분이 ${emotion}해요`, user?.id || 0),
    onSuccess: (result) => {
      toast({
        title: "AI 위로 메시지",
        description: result.comfortMessage,
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "감정 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    analyzeEmotion.mutate(emotion);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">안녕하세요!</h2>
            <p className="text-gray-600">{user?.anonymousName || "따뜻한 달팽이"}</p>
          </div>
          <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        {/* Today's Emotion Check */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">오늘의 기분은 어떠세요?</h3>
          <EmotionSelector 
            onEmotionSelect={handleEmotionSelect}
            selectedEmotion={selectedEmotion}
          />
        </div>
      </div>
      
      {/* Main Features Grid */}
      <div className="p-6 space-y-4 pb-24">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/chat">
            <button className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">랜덤 대화</h3>
                <p className="text-gray-600 text-xs">누군가와 이야기해요</p>
              </div>
            </button>
          </Link>
          
          <button 
            onClick={() => analyzeEmotion.mutate("힘들어")}
            className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">AI 위로</h3>
              <p className="text-gray-600 text-xs">마음을 달래드려요</p>
            </div>
          </button>
        </div>
        
        {/* Feature Cards */}
        <div className="space-y-3">
          <button className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">써클 대화</h3>
              <p className="text-gray-600 text-sm">순서대로 이야기하는 모임</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">타임어택</h3>
              <p className="text-gray-600 text-sm">빠르게 속마음 털어놓기</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <Link href="/diary">
            <button className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-800">감정 일기</h3>
                <p className="text-gray-600 text-sm">오늘의 마음을 기록해요</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
          
          <Link href="/stats">
            <button className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-800">감정 통계</h3>
                <p className="text-gray-600 text-sm">내 마음의 변화를 확인</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">최근 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm">AI로부터 위로 메시지를 받았어요</p>
                <p className="text-gray-500 text-xs">2시간 전</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm">감정 일기를 작성했어요</p>
                <p className="text-gray-500 text-xs">어제</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

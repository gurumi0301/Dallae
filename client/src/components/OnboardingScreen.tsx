interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex flex-col justify-center items-center p-8 z-50">
      {/* Decorative circles for warmth */}
      <div className="absolute top-10 right-10 w-20 h-20 peach-100 rounded-full opacity-60"></div>
      <div className="absolute bottom-20 left-8 w-16 h-16 soft-blue-200 rounded-full opacity-40"></div>
      <div className="absolute top-1/3 left-6 w-12 h-12 mint-200 rounded-full opacity-50"></div>
      
      {/* Logo and App Name */}
      <div className="text-center mb-12 z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">마음담기</h1>
        <p className="text-gray-600 text-sm px-4">익명으로 안전하게, 감정을 나누는 공간</p>
      </div>
      
      {/* Features Preview */}
      <div className="space-y-4 mb-12 w-full">
        <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-2xl p-4">
          <div className="w-12 h-12 soft-blue-200 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-soft-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">완전한 익명성</h3>
            <p className="text-gray-600 text-sm">개인정보 없이 안전하게</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-2xl p-4">
          <div className="w-12 h-12 mint-200 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-mint-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">따뜻한 대화</h3>
            <p className="text-gray-600 text-sm">AI와 사람이 함께 위로</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-2xl p-4">
          <div className="w-12 h-12 peach-200 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-peach-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">감정 기록</h3>
            <p className="text-gray-600 text-sm">내 마음의 변화를 확인</p>
          </div>
        </div>
      </div>
      
      {/* Start Button */}
      <button 
        onClick={onComplete}
        className="w-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold py-4 rounded-2xl shadow-lg transform transition-transform active:scale-95"
      >
        시작하기
      </button>
      
      <p className="text-gray-500 text-xs mt-6 text-center px-4">
        서비스 이용 시 개인정보처리방침 및 이용약관에 동의하게 됩니다
      </p>
    </div>
  );
}

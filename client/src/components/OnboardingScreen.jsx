import React, { useState } from 'react';

export default function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "마음담기에 오신 것을 환영합니다",
      description: "익명으로 안전하게 감정을 나누는 공간입니다",
      icon: "💙",
    },
    {
      title: "감정 기록하기",
      description: "매일의 감정을 기록하고 나만의 패턴을 발견하세요",
      icon: "📝",
    },
    {
      title: "AI와 대화하기",
      description: "AI가 당신의 마음을 이해하고 따뜻한 위로를 전해드려요",
      icon: "🤖",
    },
    {
      title: "익명 채팅",
      description: "같은 고민을 가진 다른 사람들과 익명으로 대화해보세요",
      icon: "💬",
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="slide-content">
          <div className="slide-icon">{slides[currentSlide].icon}</div>
          <h1 className="slide-title">{slides[currentSlide].title}</h1>
          <p className="slide-description">{slides[currentSlide].description}</p>
        </div>

        <div className="slide-indicators">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="slide-buttons">
          <button onClick={skipOnboarding} className="btn btn-secondary">
            건너뛰기
          </button>
          <button onClick={nextSlide} className="btn btn-primary">
            {currentSlide === slides.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>

      <style>{`
        .onboarding-container {
          height: 100vh;
          background: linear-gradient(135deg, var(--soft-blue), var(--mint));
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .onboarding-content {
          text-align: center;
          max-width: 320px;
          width: 100%;
        }

        .slide-content {
          margin-bottom: 48px;
        }

        .slide-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .slide-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .slide-description {
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.5;
        }

        .slide-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          transition: all 0.3s;
        }

        .indicator.active {
          background-color: var(--white);
          transform: scale(1.2);
        }

        .slide-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
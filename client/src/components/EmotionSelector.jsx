import { useState } from "react";

const emotions = [
  { key: 'sad', emoji: '😢', label: '힘들어요', bgColor: 'bg-red-50 hover:bg-red-100' },
  { key: 'worried', emoji: '😰', label: '걱정돼요', bgColor: 'bg-orange-50 hover:bg-orange-100' },
  { key: 'neutral', emoji: '😐', label: '보통이에요', bgColor: 'bg-yellow-50 hover:bg-yellow-100' },
  { key: 'good', emoji: '😊', label: '좋아요', bgColor: 'bg-green-50 hover:bg-green-100' },
  { key: 'happy', emoji: '😄', label: '행복해요', bgColor: 'bg-blue-50 hover:bg-blue-100' },
];

const diaryEmotions = [
  { key: 'happy', emoji: '😊', label: '기쁨' },
  { key: 'sad', emoji: '😢', label: '슬픔' },
  { key: 'angry', emoji: '😠', label: '분노' },
  { key: 'anxious', emoji: '😰', label: '불안' },
  { key: 'excited', emoji: '🤗', label: '설렘' },
  { key: 'tired', emoji: '😴', label: '피곤' },
];

export default function EmotionSelector({ onEmotionSelect, selectedEmotion, size = 'small' }) {
  const emotionList = size === 'large' ? diaryEmotions : emotions;
  
  return (
    <div className={`${size === 'large' ? 'grid grid-cols-3 gap-3' : 'flex justify-between'}`}>
      {emotionList.map((emotion) => (
        <button
          key={emotion.key}
          onClick={() => onEmotionSelect(emotion.key)}
          className={`
            emotion-button
            ${size === 'large' ? 'bg-white shadow-sm hover:shadow-md border-2' : emotion.bgColor}
            ${selectedEmotion === emotion.key 
              ? size === 'large' 
                ? 'border-soft-blue-400 soft-blue-50' 
                : 'ring-2 ring-soft-blue-400 soft-blue-100'
              : size === 'large' 
                ? 'border-transparent' 
                : ''
            }
          `}
        >
          <span className={`${size === 'large' ? 'text-3xl mb-2' : 'text-2xl'}`}>
            {emotion.emoji}
          </span>
          <span className="text-xs text-gray-600">{emotion.label}</span>
        </button>
      ))}
    </div>
  );
}
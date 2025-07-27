import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import '../styles/PsychologyTest.css';

export default function PsychologyTest() {
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // 심리검사 데이터 가져오기
  const { data: test, isLoading } = useQuery({
    queryKey: ['/api/psychology-tests/default'],
  });

  // 결과 제출
  const submitTestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('/api/psychology-tests/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setTestResult(data.results);
      setIsCompleted(true);
    },
    onError: (error) => {
      console.error('Test submission error:', error);
    }
  });

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 모든 질문 완료, 결과 제출
      submitTestMutation.mutate({
        testId: test.id,
        answers: answers
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="psychology-test-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p className="loading-text">심리검사를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="psychology-test-container">
        <div className="error-section">
          <h2>심리검사를 불러올 수 없습니다</h2>
          <button onClick={() => setLocation('/')} className="back-button">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted && testResult) {
    return (
      <div className="psychology-test-container">
        <div className="result-section">
          <div className="result-header">
            <h1 className="result-title">심리검사 완료</h1>
            <p className="result-subtitle">검사 결과를 확인해보세요</p>
          </div>

          <div className="result-content">
            <div className="result-score">
              <h3>종합 점수</h3>
              <div className="score-display">
                <span className="score-number">{testResult.totalScore}</span>
                <span className="score-total">/ 100</span>
              </div>
            </div>

            <div className="result-analysis">
              <h3>분석 결과</h3>
              <p className="analysis-text">{testResult.analysis}</p>
            </div>

            <div className="result-categories">
              <h3>세부 영역별 점수</h3>
              <div className="category-list">
                {testResult.categories?.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      <span className="category-score">{category.score}/20</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress" 
                        style={{ width: `${(category.score / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-recommendations">
              <h3>추천사항</h3>
              <ul className="recommendation-list">
                {testResult.recommendations?.map((rec, index) => (
                  <li key={index} className="recommendation-item">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="result-actions">
            <button onClick={handleComplete} className="complete-button">
              마음담기 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="psychology-test-container">
      <div className="test-header">
        <h1 className="test-title">{test.name}</h1>
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {currentQuestionIndex + 1} / {test.questions.length}
          </span>
        </div>
      </div>

      <div className="question-section">
        <div className="question-card">
          <h2 className="question-text">{currentQuestion.text}</h2>
          
          <div className="answer-options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                className={`answer-option ${
                  answers[currentQuestion.id] === option.value ? 'selected' : ''
                }`}
              >
                <span className="option-label">{option.label}</span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="test-navigation">
        <button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="nav-button secondary"
        >
          이전
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className="nav-button primary"
        >
          {currentQuestionIndex === test.questions.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
}
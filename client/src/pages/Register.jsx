import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import '../styles/Auth.css';

export default function Register() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    email: '',
    phone: '',
    verificationCode: ''
  });
  const [errors, setErrors] = useState({});
  const [verificationSent, setVerificationSent] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.requiresVerification) {
        setCurrentStep(3);
        setVerificationSent(true);
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setLocation('/auth/psychology-test');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
      setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setLocation('/auth/psychology-test');
    },
    onError: (error) => {
      console.error('Verification error:', error);
      setErrors({ verificationCode: '인증 코드가 올바르지 않습니다.' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (currentStep === 1) {
      // 1단계: 기본 정보 검증
      if (!formData.username.trim()) {
        setErrors({ username: '아이디를 입력해주세요' });
        return;
      }
      if (formData.username.length < 3) {
        setErrors({ username: '아이디는 3자 이상이어야 합니다' });
        return;
      }
      if (!formData.password.trim()) {
        setErrors({ password: '비밀번호를 입력해주세요' });
        return;
      }
      if (formData.password.length < 6) {
        setErrors({ password: '비밀번호는 6자 이상이어야 합니다' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // 2단계: 실명 인증
      if (!formData.realName.trim()) {
        setErrors({ realName: '실명을 입력해주세요' });
        return;
      }
      if (formData.realName.length < 2) {
        setErrors({ realName: '실명은 2자 이상이어야 합니다' });
        return;
      }
      if (!formData.phone.trim()) {
        setErrors({ phone: '휴대폰 번호를 입력해주세요' });
        return;
      }
      
      // 회원가입 진행
      registerMutation.mutate({
        username: formData.username,
        password: formData.password,
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone
      });
    } else if (currentStep === 3) {
      // 3단계: 인증 코드 확인
      if (!formData.verificationCode.trim()) {
        setErrors({ verificationCode: '인증 코드를 입력해주세요' });
        return;
      }
      
      verifyMutation.mutate({
        username: formData.username,
        verificationCode: formData.verificationCode
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">회원가입</h1>
          <div className="auth-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. 기본정보</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. 실명인증</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. 인증완료</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {/* 1단계: 기본 정보 */}
          {currentStep === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="username" className="form-label">아이디</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="아이디를 입력하세요 (3자 이상)"
                />
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">비밀번호</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="비밀번호를 입력하세요 (6자 이상)"
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </>
          )}

          {/* 2단계: 실명 인증 */}
          {currentStep === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="realName" className="form-label">실명</label>
                <input
                  type="text"
                  id="realName"
                  name="realName"
                  value={formData.realName}
                  onChange={handleChange}
                  className={`form-input ${errors.realName ? 'error' : ''}`}
                  placeholder="실명을 입력하세요"
                />
                {errors.realName && (
                  <span className="error-message">{errors.realName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">휴대폰 번호</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="휴대폰 번호를 입력하세요"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">이메일 (선택)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="이메일을 입력하세요 (선택사항)"
                />
              </div>
            </>
          )}

          {/* 3단계: 인증 코드 */}
          {currentStep === 3 && (
            <>
              <div className="verification-info">
                <p className="verification-text">
                  휴대폰으로 인증 코드를 발송했습니다.
                  <br />
                  인증 코드를 입력해주세요.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="verificationCode" className="form-label">인증 코드</label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className={`form-input ${errors.verificationCode ? 'error' : ''}`}
                  placeholder="인증 코드를 입력하세요"
                />
                {errors.verificationCode && (
                  <span className="error-message">{errors.verificationCode}</span>
                )}
              </div>
            </>
          )}

          <div className="auth-buttons">
            {currentStep > 1 && currentStep < 3 && (
              <button type="button" onClick={handlePrevStep} className="auth-button secondary">
                이전
              </button>
            )}
            <button 
              type="submit" 
              className="auth-button primary"
              disabled={registerMutation.isPending || verifyMutation.isPending}
            >
              {currentStep === 1 && '다음'}
              {currentStep === 2 && (registerMutation.isPending ? '가입 중...' : '회원가입')}
              {currentStep === 3 && (verifyMutation.isPending ? '인증 중...' : '인증완료')}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <p className="auth-link-text">
            이미 계정이 있으신가요? 
            <Link href="/login" className="auth-link">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
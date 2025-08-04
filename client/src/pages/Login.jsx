import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import '../styles/Auth.css';

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setLocation('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
      setErrors({ general: '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.username.trim()) {
      setErrors({ username: '아이디를 입력해주세요' });
      return;
    }
    
    if (!formData.password.trim()) {
      setErrors({ password: '비밀번호를 입력해주세요' });
      return;
    }

    loginMutation.mutate(formData);
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">로그인</h1>
          <p className="auth-subtitle">달래에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="아이디를 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-links">
          <p className="auth-link-text">
            계정이 없으신가요? 
            <Link href="/auth/register" className="auth-link">회원가입</Link>
          </p>
          <p className="auth-link-text">
            비회원으로 이용하고 싶으신가요? 
            <Link href="/" className="auth-link">비회원 모드</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link, useLocation } from 'wouter';
import './DesktopSidebar.css';

export default function DesktopSidebar() {
  const [location] = useLocation();

  const navigationItems = [
    {
      path: '/',
      icon: '🏠',
      label: '홈',
      description: '메인 화면'
    },
    {
      path: '/chat',
      icon: '💬',
      label: '채팅',
      description: '익명 대화'
    },
    {
      path: '/recommendations',
      icon: '⭐',
      label: '추천',
      description: '맞춤 추천'
    },
    {
      path: '/diary',
      icon: '📝',
      label: '다이어리',
      description: '감정 기록'
    },
    {
      path: '/profile',
      icon: '👤',
      label: '프로필',
      description: '내 정보'
    }
  ];

  return (
    <nav className="desktop-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🌈</span>
          <h1 className="logo-text">마음담기</h1>
        </div>
        <p className="sidebar-subtitle">익명 감정 지원 플랫폼</p>
      </div>

      <div className="sidebar-nav">
        {navigationItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`sidebar-nav-item ${location === item.path ? 'active' : ''}`}
          >
            <div className="nav-item-icon">{item.icon}</div>
            <div className="nav-item-content">
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-description">{item.description}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-indicator"></div>
          <span className="status-text">온라인</span>
        </div>
      </div>
    </nav>
  );
}
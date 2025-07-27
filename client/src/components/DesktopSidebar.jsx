import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, MessageCircle, Heart, BookOpen, User, Settings, Menu, X } from 'lucide-react';
import './DesktopSidebar.css';

export default function DesktopSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: '홈',
      description: '메인 화면'
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: '채팅',
      description: '익명 대화'
    },
    {
      path: '/recommendations/music',
      icon: Heart,
      label: '추천',
      description: '맞춤 추천'
    },
    {
      path: '/diary',
      icon: BookOpen,
      label: '다이어리',
      description: '감정 기록'
    },
    {
      path: '/profile',
      icon: User,
      label: '프로필',
      description: '내 정보'
    },
    {
      path: '/settings/ai',
      icon: Settings,
      label: '설정',
      description: '앱 설정'
    }
  ];

  // body에 클래스 추가/제거로 전체 레이아웃 조정
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  return (
    <nav className={`desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🌈</span>
          <h1 className="logo-text">마음담기</h1>
        </div>
        <p className="sidebar-subtitle">익명 감정 지원 플랫폼</p>
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <div className="sidebar-nav">
        {navigationItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === '/chat' && location.startsWith('/chat/')) ||
            (item.path === '/recommendations/music' && location.startsWith('/recommendations')) ||
            (item.path === '/profile' && location.startsWith('/profile')) ||
            (item.path === '/settings/ai' && location.startsWith('/settings'));
            
          return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-icon">
              {React.createElement(item.icon, { size: 18 })}
            </div>
            <div className="nav-item-content">
              <span className="nav-item-title">{item.label}</span>
            </div>
          </Link>
          );
        })}
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
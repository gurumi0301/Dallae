import React from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      name: '홈',
      path: '/',
      icon: '🏠',
      activeIcon: '🏠'
    },
    {
      name: '채팅',
      path: '/chat',
      icon: '💬',
      activeIcon: '💬'
    },
    {
      name: '추천',
      path: '/recommendations',
      icon: '⭐',
      activeIcon: '⭐'
    },
    {
      name: '일기',
      path: '/diary',
      icon: '📝',
      activeIcon: '📝'
    },
    {
      name: '프로필',
      path: '/profile',
      icon: '👤',
      activeIcon: '👤'
    }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location === item.path || 
          (item.path === '/chat' && location.startsWith('/chat/')) ||
          (item.path === '/recommendations' && location.startsWith('/recommendations')) ||
          (item.path === '/profile' && location.startsWith('/profile'));
        
        return (
          <Link key={item.path} href={item.path} className="nav-item">
            <div className={`nav-item-content ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="nav-text">{item.name}</span>
            </div>
          </Link>
        );
      })}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 428px;
          background: var(--white);
          border-top: 1px solid var(--gray-200);
          display: flex;
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
          z-index: 50;
        }

        .nav-item {
          flex: 1;
          text-decoration: none;
          color: inherit;
        }

        .nav-item-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 4px;
          transition: all 0.2s;
        }

        .nav-item-content.active {
          color: var(--soft-blue);
        }

        .nav-item-content:not(.active) {
          color: var(--gray-500);
        }

        .nav-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .nav-text {
          font-size: 11px;
          font-weight: 500;
        }

        .nav-item-content:hover {
          color: var(--soft-blue);
        }
      `}</style>
    </nav>
  );
}
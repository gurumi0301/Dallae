import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useRoute, Link } from 'wouter';
import '../styles/Settings.css';

export default function SettingsTab() {
  const { user } = useAnonymousUser();
  const [match, params] = useRoute('/settings/:type');
  const activeTab = params?.type || 'ai';
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 첫 진입 시에만 로딩 표시
  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasLoaded(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [activeTab, hasLoaded]);

  const tabs = [
    { id: 'ai', name: 'AI 설정', emoji: '🤖' },
    { id: 'theme', name: '테마', emoji: '🎨' },
    { id: 'home', name: '홈화면', emoji: '🏠' },
    { id: 'privacy', name: '개인정보', emoji: '🔒' },
    { id: 'notification', name: '알림', emoji: '🔔' }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3 className="section-title">AI 응답 설정</h3>
              <div className="setting-item">
                <label className="setting-label">응답 톤</label>
                <select className="setting-select">
                  <option value="friendly">친근한 톤</option>
                  <option value="formal">정중한 톤</option>
                  <option value="casual">편안한 톤</option>
                </select>
              </div>
              <div className="setting-item">
                <label className="setting-label">응답 길이</label>
                <select className="setting-select">
                  <option value="short">간단하게</option>
                  <option value="medium">보통</option>
                  <option value="long">자세하게</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    감정 분석 활성화
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">위로 메시지 설정</h3>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    자동 위로 메시지
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <label className="setting-label">위로 스타일</label>
                <select className="setting-select">
                  <option value="empathetic">공감형</option>
                  <option value="solution">해결책 제시형</option>
                  <option value="encouragement">격려형</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3 className="section-title">화면 테마</h3>
              <div className="theme-options">
                <div className="theme-option active">
                  <div className="theme-preview light"></div>
                  <span className="theme-name">라이트 모드</span>
                </div>
                <div className="theme-option">
                  <div className="theme-preview dark"></div>
                  <span className="theme-name">다크 모드</span>
                </div>
                <div className="theme-option">
                  <div className="theme-preview auto"></div>
                  <span className="theme-name">시스템 설정</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">색상 테마</h3>
              <div className="color-options">
                <div className="color-option active" style={{background: 'linear-gradient(135deg, var(--soft-blue), var(--mint))'}}></div>
                <div className="color-option" style={{background: 'linear-gradient(135deg, #ff6b6b, #feca57)'}}></div>
                <div className="color-option" style={{background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)'}}></div>
                <div className="color-option" style={{background: 'linear-gradient(135deg, #00b894, #00cec9)'}}></div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">글꼴 설정</h3>
              <div className="setting-item">
                <label className="setting-label">글꼴 크기</label>
                <div className="font-size-options">
                  <button className="font-size-btn">작게</button>
                  <button className="font-size-btn active">보통</button>
                  <button className="font-size-btn">크게</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'home':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3 className="section-title">홈화면 구성</h3>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    오늘의 감정 표시
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    빠른 액션 버튼
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                    일일 목표 표시
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">위젯 순서</h3>
              <div className="widget-list">
                <div className="widget-item">
                  <span className="widget-name">감정 체크인</span>
                  <button className="widget-move">⋮⋮</button>
                </div>
                <div className="widget-item">
                  <span className="widget-name">빠른 액션</span>
                  <button className="widget-move">⋮⋮</button>
                </div>
                <div className="widget-item">
                  <span className="widget-name">오늘의 추천</span>
                  <button className="widget-move">⋮⋮</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3 className="section-title">개인정보 보호</h3>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    익명성 보장
                  </label>
                </div>
                <p className="setting-description">개인 정보를 수집하지 않으며 완전 익명으로 서비스를 이용할 수 있습니다.</p>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                    데이터 수집 동의
                  </label>
                </div>
                <p className="setting-description">서비스 개선을 위한 익명 사용 패턴 수집에 동의합니다.</p>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">데이터 관리</h3>
              <div className="setting-actions">
                <button className="setting-action-btn secondary">데이터 내보내기</button>
                <button className="setting-action-btn danger">모든 데이터 삭제</button>
              </div>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3 className="section-title">알림 설정</h3>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    푸시 알림
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                    일일 체크인 알림
                  </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                    채팅 메시지 알림
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="section-title">알림 시간</h3>
              <div className="setting-item">
                <label className="setting-label">일일 체크인</label>
                <input type="time" className="setting-time" defaultValue="09:00" />
              </div>
              <div className="setting-item">
                <label className="setting-label">저녁 회고</label>
                <input type="time" className="setting-time" defaultValue="21:00" />
              </div>
            </div>
          </div>
        );

      default:
        return <div>설정을 불러올 수 없습니다.</div>;
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1 className="page-title">설정</h1>
        <p className="page-subtitle">{currentTab?.name} 설정</p>
      </header>

      {/* 탭 네비게이션 */}
      <section className="tabs-section">
        <div className="browser-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/settings/${tab.id}`}
              className={`browser-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-name">{tab.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 설정 콘텐츠 */}
      <section className="settings-section">
        {isLoading ? (
          <div className="settings-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">{currentTab?.name} 설정을 불러오는 중...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </section>

      <div className="bottom-spacer"></div>
    </div>
  );
}
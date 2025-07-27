import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Settings() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 기본적으로 ai 탭으로 리다이렉트
    if (location === '/settings') {
      setLocation('/settings/ai');
    }
  }, [location, setLocation]);

  return null; // 리다이렉트만 담당
}
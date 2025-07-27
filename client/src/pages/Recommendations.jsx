import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Recommendations() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 기본적으로 music 탭으로 리다이렉트
    if (location === '/recommendations') {
      setLocation('/recommendations/music');
    }
  }, [location, setLocation]);

  return null; // 리다이렉트만 담당
}
const adjectives = [
  '따뜻한', '다정한', '용감한', '지혜로운', '차분한', '밝은', '친근한', '신비로운',
  '꿈꾸는', '당당한', '온화한', '활발한', '영리한', '평화로운', '즐거운', '성실한',
  '배려깊은', '상냥한', '유쾌한', '인내심있는', '낙천적인', '정직한', '겸손한', '유연한'
];

const animals = [
  '고양이', '강아지', '토끼', '새', '나비', '물고기', '거북이', '다람쥐',
  '펭귄', '코알라', '판다', '햄스터', '올빼미', '여우', '사슴', '달팽이',
  '비둘기', '까치', '참새', '고래', '돌고래', '곰', '늑대', '독수리'
];

export function generateAnonymousName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective} ${animal}`;
}

export function generateSessionId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
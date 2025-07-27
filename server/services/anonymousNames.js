const ADJECTIVES = [
  '따뜻한', '상냥한', '밝은', '친근한', '다정한', '순수한', '귀여운', '사랑스러운',
  '평화로운', '조용한', '신비로운', '우아한', '당당한', '씩씩한', '활발한', '유쾌한',
  '지혜로운', '차분한', '용감한', '친절한', '웃는', '반짝이는', '포근한', '고요한',
  '빛나는', '곱슬한', '털복숭이', '작은', '큰', '날렵한', '느긋한', '꿈꾸는'
];

const ANIMALS = [
  '고양이', '강아지', '토끼', '햄스터', '다람쥐', '여우', '판다', '코알라',
  '펭귄', '돌고래', '나비', '새', '물고기', '거북이', '달팽이', '벌', 
  '사슴', '양', '염소', '말', '호랑이', '사자', '곰', '늑대',
  '독수리', '올빼미', '참새', '비둘기', '까치', '까마귀', '백조', '오리'
];

const OBJECTS = [
  '별', '달', '해', '구름', '꽃', '나무', '잎', '돌',
  '바다', '강', '산', '언덕', '다리', '집', '창', '문',
  '책', '연필', '종이', '편지', '음표', '그림', '거울', '램프',
  '쿠키', '케이크', '차', '커피', '빵', '사탕', '초콜릿', '꿀'
];

export function generateAnonymousName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = Math.random() > 0.7 
    ? OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
    : ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  
  return `${adjective} ${noun}`;
}

export function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
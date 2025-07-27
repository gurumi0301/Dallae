const INAPPROPRIATE_KEYWORDS = [
  // 욕설
  '시발', '개새끼', '병신', '미친', '좆', '씨발', '빨아', '꺼져',
  '죽어', '뒤져', '개자식', '새끼', '년', '놈', '개', '조까',
  
  // 자해/자살 관련
  '자살', '죽고싶', '죽어버리', '자해', '목매', '뛰어내리', '약먹고',
  '칼로', '손목', '피', '죽음', '사라지고싶', '없어지고싶',
  
  // 개인정보
  '전화번호', '주소', '실명', '학교이름', '회사이름', '카카오톡',
  '인스타', '페이스북', '만나자', '연락처',
  
  // 성적 내용
  '섹스', '성행위', '음란', '야동', '포르노', '자위', '강간',
  '성추행', '성폭행', '몸매', '가슴', '엉덩이'
];

const CRISIS_KEYWORDS = [
  '자살', '죽고싶', '죽어버리', '자해', '목매', '뛰어내리',
  '약먹고', '칼로', '손목', '피', '죽음', '사라지고싶', '없어지고싶',
  '힘들어서', '견딜수없', '포기하고싶', '그만두고싶'
];

export function filterContent(content) {
  const lowercaseContent = content.toLowerCase();
  
  // 위기 상황 키워드 체크
  const containsCrisisKeyword = CRISIS_KEYWORDS.some(keyword => 
    lowercaseContent.includes(keyword)
  );
  
  // 부적절한 키워드 체크
  const inappropriateKeyword = INAPPROPRIATE_KEYWORDS.find(keyword => 
    lowercaseContent.includes(keyword)
  );
  
  if (inappropriateKeyword) {
    const filteredContent = content.replace(
      new RegExp(inappropriateKeyword, 'gi'), 
      '*'.repeat(inappropriateKeyword.length)
    );
    
    return {
      isFiltered: true,
      isCrisis: containsCrisisKeyword,
      filteredContent,
      reason: '부적절한 언어가 포함되어 있어 일부 내용이 필터링되었습니다.'
    };
  }
  
  return {
    isFiltered: false,
    isCrisis: containsCrisisKeyword
  };
}

export function validateContentLength(content) {
  return content.length > 0 && content.length <= 1000;
}

export function sanitizeContent(content) {
  return content
    .trim()
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/[<>]/g, '') // HTML 태그 방지
    .substring(0, 1000); // 최대 길이 제한
}
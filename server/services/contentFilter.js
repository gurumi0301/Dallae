// Content filtering and validation
const inappropriateKeywords = [
  '자살', '죽고싶', '생을마감', '목숨을끊', 
  '비속어1', '비속어2', '욕설1', '욕설2'
];

const crisisKeywords = [
  '자살', '죽고싶', '생을마감', '목숨을끊', '자해',
  '우울', '절망', '포기', '희망없', '의미없'
];

export function validateContentLength(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }
  return content.length >= 1 && content.length <= 2000;
}

export function sanitizeContent(content) {
  if (!content) return '';
  
  // Remove any potentially harmful HTML/script tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function filterContent(content) {
  const lowercaseContent = content.toLowerCase();
  
  // Check for inappropriate content
  const foundInappropriate = inappropriateKeywords.find(keyword => 
    lowercaseContent.includes(keyword)
  );
  
  if (foundInappropriate) {
    return {
      isFiltered: true,
      reason: '부적절한 내용이 포함되어 있습니다.',
      filteredContent: content.replace(new RegExp(foundInappropriate, 'gi'), '***'),
      isCrisis: false
    };
  }
  
  // Check for crisis content
  const foundCrisis = crisisKeywords.find(keyword => 
    lowercaseContent.includes(keyword)
  );
  
  if (foundCrisis) {
    return {
      isFiltered: false,
      reason: null,
      filteredContent: content,
      isCrisis: true
    };
  }
  
  return {
    isFiltered: false,
    reason: null,
    filteredContent: content,
    isCrisis: false
  };
}
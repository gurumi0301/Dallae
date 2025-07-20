// API utility functions
export async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Emotion analysis API
export async function analyzeEmotion(content, userId) {
  return apiRequest('/api/emotions/analyze', {
    method: 'POST',
    body: JSON.stringify({ content, userId }),
  });
}

// Diary API
export async function createDiaryEntry(entryData) {
  return apiRequest('/api/diary', {
    method: 'POST',
    body: JSON.stringify(entryData),
  });
}

export async function getDiaryEntries(userId, limit = 50) {
  return apiRequest(`/api/diary?userId=${userId}&limit=${limit}`);
}

// Stats API
export async function getUserStats(userId) {
  return apiRequest(`/api/stats?userId=${userId}`);
}

// Chat API
export async function matchChat(userId) {
  return apiRequest('/api/chat/match', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function sendChatMessage(messageData) {
  return apiRequest('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
}

export async function getChatMessages(sessionId, limit = 50) {
  return apiRequest(`/api/chat/messages?sessionId=${sessionId}&limit=${limit}`);
}
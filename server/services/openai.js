import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'default_key',
});

export async function analyzeEmotionAndGenerateComfort(content) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 감정 분석 및 위로 전문가입니다. 사용자의 텍스트를 분석하여 감정을 파악하고 따뜻한 위로 메시지를 제공하세요.

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "emotion": "감정 (happy, sad, anxious, angry, neutral 중 하나)",
  "confidence": 신뢰도 (0-100 숫자),
  "comfortMessage": "따뜻하고 공감적인 위로 메시지 (한국어, 50자 이내)"
}

한국 문화와 정서에 맞는 따뜻하고 진심어린 위로를 제공하세요.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const result = response.choices[0].message.content;
    const parsed = JSON.parse(result);
    
    return {
      emotion: parsed.emotion || 'neutral',
      confidence: parsed.confidence || 50,
      comfortMessage: parsed.comfortMessage || '따뜻한 마음으로 함께하겠습니다.'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response when OpenAI is unavailable
    return {
      emotion: 'neutral',
      confidence: 50,
      comfortMessage: '당신의 감정을 이해합니다. 언제든 이야기해 주세요.'
    };
  }
}

export async function generateAIComfortMessage(emotion, context) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 따뜻한 AI 친구입니다. 사용자의 감정 상태에 맞는 위로와 격려의 메시지를 제공하세요. 
          응답은 50자 이내의 한국어로, 친근하고 따뜻한 톤으로 작성해주세요.`
        },
        {
          role: 'user',
          content: `사용자 감정: ${emotion}, 상황: ${context}`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI comfort message error:', error);
    return '당신과 함께 있어서 마음이 따뜻해집니다. 힘내세요! 💙';
  }
}

export async function detectCrisisContent(content) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `위기 상황 감지 전문가입니다. 텍스트를 분석하여 자해, 자살 등의 위험도를 평가하세요.

응답 형식:
{
  "isCrisis": true/false,
  "severity": 위험도 (1-10),
  "reason": "위험 요소 설명"
}`
        },
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      isCrisis: result.isCrisis || false,
      severity: result.severity || 1,
      reason: result.reason || ''
    };
  } catch (error) {
    console.error('Crisis detection error:', error);
    return {
      isCrisis: false,
      severity: 1,
      reason: 'Unable to analyze'
    };
  }
}
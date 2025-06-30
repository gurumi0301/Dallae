import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  intensity: number;
  comfortMessage: string;
}

export async function analyzeEmotionAndGenerateComfort(text: string): Promise<EmotionAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `당신은 한국어 전문 감정 분석 및 심리 상담 AI입니다. 사용자의 텍스트를 분석하여 다음을 제공해주세요:

1. 주된 감정 (happy, sad, angry, anxious, excited, tired, neutral 중 하나)
2. 확신도 (0-100 사이의 숫자)
3. 감정 강도 (1-10 사이의 숫자)
4. 따뜻하고 공감적인 위로 메시지 (한국어, 100자 이내)

응답은 반드시 JSON 형식으로 해주세요: {"emotion": "감정", "confidence": 숫자, "intensity": 숫자, "comfortMessage": "위로메시지"}

위로 메시지는 다음 원칙을 따라주세요:
- 공감적이고 따뜻한 톤
- 사용자의 감정을 인정하고 수용
- 긍정적인 방향성 제시
- 구체적이고 실용적인 조언 포함
- 한국 문화와 정서에 적합한 표현`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      emotion: result.emotion || "neutral",
      confidence: Math.max(0, Math.min(100, result.confidence || 50)),
      intensity: Math.max(1, Math.min(10, result.intensity || 5)),
      comfortMessage: result.comfortMessage || "힘든 시간을 보내고 계시는군요. 당신의 마음을 이해합니다. 조금씩 나아질 거예요.",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      emotion: "neutral",
      confidence: 50,
      intensity: 5,
      comfortMessage: "지금 이 순간도 충분히 잘하고 계세요. 당신의 마음을 응원합니다.",
    };
  }
}

export async function generateAIComfortMessage(emotion: string, context?: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 공감적인 한국어 심리상담 AI입니다. 사용자의 감정 상태에 맞는 위로와 격려의 메시지를 생성해주세요.

감정별 메시지 가이드라인:
- happy: 기쁜 마음을 함께 나누고 축하
- sad: 깊은 공감과 따뜻한 위로
- angry: 감정을 인정하고 건설적인 방향 제시
- anxious: 불안을 수용하고 안정감 제공
- excited: 설렘을 함께 나누고 응원
- tired: 휴식의 필요성 인정과 자기돌봄 격려
- neutral: 평온함을 인정하고 긍정적 에너지 제공

메시지는 100자 이내로 작성하고, 한국의 정서와 문화에 맞게 표현해주세요.`
        },
        {
          role: "user",
          content: `감정: ${emotion}${context ? `, 상황: ${context}` : ''}`
        },
      ],
    });

    return response.choices[0].message.content || "당신의 마음을 이해하고 응원합니다. 함께 이겨나가요.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    const defaultMessages: Record<string, string> = {
      happy: "기쁜 마음이 오래오래 지속되길 바라요. 행복한 순간을 만끽하세요! 🌟",
      sad: "힘든 시간이지만 당신은 혼자가 아니에요. 천천히, 하루하루 나아가면 됩니다.",
      angry: "화가 나는 마음, 충분히 이해해요. 깊게 숨을 쉬고 잠시 쉬어가도 괜찮아요.",
      anxious: "불안한 마음이 드는 건 자연스러운 일이에요. 지금 이 순간에 집중해보세요.",
      excited: "설레는 마음이 느껴져요! 좋은 일들이 기다리고 있을 거예요. 응원해요! ✨",
      tired: "정말 수고 많으셨어요. 충분히 쉬어가며 자신을 돌봐주세요. 당신은 소중해요.",
      neutral: "평온한 마음도 좋은 거예요. 오늘도 당신만의 속도로 천천히 걸어가세요.",
    };
    return defaultMessages[emotion] || "당신의 마음을 이해하고 응원합니다. 함께 이겨나가요.";
  }
}

export async function detectCrisisContent(text: string): Promise<{ isCrisis: boolean; severity: number; resources?: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `당신은 위기 상황 감지 전문 AI입니다. 다음 텍스트에서 자해, 자살, 극심한 우울 등의 위기 신호를 분석하고 JSON으로 응답해주세요:

{"isCrisis": boolean, "severity": 1-10 숫자, "resources": ["도움 리소스 배열"]}

severity 기준:
1-3: 경미한 우울감
4-6: 중간 정도 심리적 어려움
7-10: 즉각적인 전문가 도움이 필요한 위기 상황

resources는 한국의 정신건강 지원 기관 정보를 포함해주세요.`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      isCrisis: result.isCrisis || false,
      severity: Math.max(1, Math.min(10, result.severity || 1)),
      resources: result.resources || [],
    };
  } catch (error) {
    console.error("Crisis detection error:", error);
    return {
      isCrisis: false,
      severity: 1,
    };
  }
}

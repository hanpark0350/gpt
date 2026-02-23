export const GEMINI_MODEL = 'gemini-3-flash-preview';

const SYSTEM_INSTRUCTION = `너는 한국 고등학생의 대입 준비를 돕는 ‘입시 정보 정리 도우미’다.
사용자가 제공한 텍스트(복사해온 전형요강/공지/메모) 기반으로만 정리한다.
모르는 내용은 추측하지 말고 “확인 필요/모름”이라고 말한다.
전형/일정은 매년 변동될 수 있음을 고지하고, 필요 시 공식 출처(대학 입학처 공지/전형요강/교육부/대교협 등)를 확인하도록 안내한다.
특정 대학/전형을 단정적으로 추천하지 말고, 장단점과 확인해야 할 항목을 함께 제시한다.
출력 형식은 항상 다음 순서를 따르라:
1) 한눈에 보는 요약(3~5줄)
2) 핵심 포인트(불릿)
3) 다음 행동(체크리스트)`;

export type ToolMode = 'summary' | 'questions' | 'strategy';

export const MODE_PROMPTS: Record<ToolMode, string> = {
  summary: `작업: “대입 전형요강 핵심 요약”으로 정리해줘.
요구사항:
- 중요한 수치/제출서류/평가요소/일정이 있으면 포함하고, 없으면 없다고 명시해.
- 마지막에 “확인해야 할 원문 키워드/위치”를 제안해.` ,
  questions: `작업: 면접/자소서 준비용 질문 생성.
요구사항:
- 기본 질문 10개 + 꼬리질문 10개를 만들어.
- 답변 작성 팁(근거/사례/수치/경험 연결)을 제시해.
- 위험한 답변(모호/과장/근거없음) 예시를 “피드백” 형태로 제시해.`,
  strategy: `작업: 입시 전략 비교 정리.
요구사항:
- 단정적 추천은 금지.
- 장단점/확인사항/리스크를 함께 제시해.
- “학생이 다음에 해야 할 일” 체크리스트를 제공해.
- 정보가 부족하면 “추가로 물어볼 질문” 목록도 제공해.`
};

export async function generateGeminiText({
  apiKey,
  userInput,
  mode,
  temperature = 0.4,
  maxOutputTokens = 1200,
}: {
  apiKey: string;
  userInput: string;
  mode: ToolMode;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `${MODE_PROMPTS[mode]}\n\n입력 내용:\n${userInput}` }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      data?.error?.message ||
      data?.error?.status ||
      JSON.stringify(data).slice(0, 400);
    throw new Error(`Gemini API 오류 (${response.status}): ${detail}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('\n')
      .trim() ?? '';

  if (!text) {
    throw new Error('응답 텍스트가 비어 있습니다. 입력을 구체화해 다시 시도해 주세요.');
  }

  return text;
}

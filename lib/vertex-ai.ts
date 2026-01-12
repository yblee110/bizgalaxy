import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedTasksResult, Task } from '@/types';

// Initialize Google Generative AI (Gemini)
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

const EXTRACT_TASKS_PROMPT = `당신은 세계 최고의 프로젝트 매니저(PM)이자 개발 리드입니다.
다음 비즈니스 기획서(또는 프로젝트 설명)를 정밀 분석하여, 사업 목표(Goals)와 실행 가능한 태스크(Tasks)를 생성해 주세요.

목표: 기획상의 아이디어를 "명확한 목표"와 "실행 가능한(Actionable) 태스크"로 완벽하게 분해하는 것.

요구사항:
1. 프로젝트의 핵심 '한 줄 요약(summary)'을 작성하세요.
2. **사업 목표(Goals)**: 프로젝트가 달성해야 할 핵심 목표 2~4개를 추출하세요. 목표는 추상적이고 장기적인 성과를 나타냅니다.
   - 예: "월 100만 명의 활성 사용자 확보", "앱스토어 평점 4.5점 달성", "매출 1억 원 돌파"
3. **실행 태스크(Tasks)**: 목표 달성을 위한 구체적 실행 계획 5~10개를 추출하세요.
   - 나쁜 예: "개발 시작", "기획서 작성"
   - 좋은 예: "Next.js 프로젝트 초기 세팅 및 Dockerfile 구성", "피그마 UI 디자인 시스템 토큰 정의"
4. 순서: 목표(Goals) 먼저, 그 다음 태스크(Tasks) 순서대로 배치하세요.

반환 포맷 (JSON):
{
  "summary": "프로젝트의 핵심 목표 요약 (50자 이내)",
  "tasks": [
    {
      "content": "목표 제목 (명확하고 측정 가능한 형태, 예: '3개월 내 1만 다운로드 달성')",
      "desc": "목표에 대한 상세 설명. 왜 이 목표가 중요한지, 성공 기준은 무엇인지 설명.",
      "status": "GOAL",
      "is_ai_generated": true,
      "order": 0
    },
    {
      "content": "태스크 제목 (핵심만 간결하게, 20자 내외)",
      "desc": "구체적인 실행 가이드. 무엇을(What), 어떻게(How) 해야 할지 상세히 기술.",
      "status": "TODO",
      "is_ai_generated": true,
      "order": 1
    }
  ]
}

중요: 오직 유효한 JSON 문자열만 반환하세요. 마크다운(code block)이나 사족을 붙이지 마세요.

분석할 문서 내용:
`;

/**
 * Call Gemini AI to extract tasks from document
 */
export async function extractTasksFromDocument(
  documentText: string
): Promise<ExtractedTasksResult> {
  // If no API key is configured, use mock implementation
  if (!genAI) {
    console.warn('Gemini API key not configured. Using mock implementation.');
    return mockExtractTasks(documentText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview', // Use Gemini 3 Pro preview
    });

    const prompt = EXTRACT_TASKS_PROMPT + documentText;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response (remove markdown code blocks if present)
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Validate the response structure
    if (!parsed.summary || !Array.isArray(parsed.tasks)) {
      throw new Error('Invalid AI response structure');
    }

    return {
      summary: parsed.summary,
      tasks: parsed.tasks.map((task: any) => ({
        content: task.content || 'New Task',
        desc: task.desc || '',
        status: 'TODO' as const,
        is_ai_generated: true,
        order: task.order || 0,
      })),
    };
  } catch (error) {
    console.error('Error extracting tasks from Gemini:', error);
    // Fall back to mock implementation on error
    return mockExtractTasks(documentText);
  }
}

/**
 * Generate project summary from document
 */
export async function generateSummary(
  documentText: string
): Promise<string> {
  if (!genAI) {
    return '비즈니스 프로젝트 기획서';
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
    });

    const prompt = `다음 문서를 한 문장(최대 50자)으로 요약해:

${documentText}

요약:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return '비즈니스 프로젝트 기획서';
  }
}

/**
 * Mock implementation for development/demo
 */
async function mockExtractTasks(
  documentText: string
): Promise<ExtractedTasksResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate mock goals and tasks based on document content keywords
  const mockItems: Omit<Task, 'id' | 'project_id' | 'created_at'>[] = [];
  const keywords = documentText.toLowerCase();

  // Add Goals first (2-3 goals)
  mockItems.push(
    {
      content: '3개월 내 1만 명 활성 사용자 확보',
      desc: '월간 활성 사용자(MAU) 1만 명 달성을 통해 서비스 안정화 및 시장 입증 완료',
      status: 'GOAL',
      is_ai_generated: true,
      order: 0,
    },
    {
      content: '앱스토어 평점 4.5점 이상 유지',
      desc: '사용자 경험 개선과 신속한 이슈 대응으로 고품질 서비스 제공',
      status: 'GOAL',
      is_ai_generated: true,
      order: 1,
    }
  );

  // Basic keyword-based task generation
  if (keywords.includes('design') || keywords.includes('디자인')) {
    mockItems.push({
      content: '디자인 시스템 구축',
      desc: 'UI 컴포넌트 라이브러리와 디자인 가이드라인 정의',
      status: 'TODO',
      is_ai_generated: true,
      order: mockItems.length,
    });
  }

  if (keywords.includes('develop') || keywords.includes('개발') || keywords.includes('code')) {
    mockItems.push({
      content: '개발 환경 설정',
      desc: '프로젝트 초기 설정, 의존성 설치, 저장소 구성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockItems.length,
    });
  }

  if (keywords.includes('test') || keywords.includes('테스트')) {
    mockItems.push({
      content: '테스트 계획 수립',
      desc: '단위 테스트, 통합 테스트, 사용자 테스트 계획 작성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockItems.length,
    });
  }

  if (keywords.includes('deploy') || keywords.includes('배포')) {
    mockItems.push({
      content: '배포 파이프라인 구축',
      desc: 'CI/CD 설정 및 배포 환경 구성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockItems.length,
    });
  }

  // Default tasks if no keywords matched
  if (mockItems.length === 2) { // Only goals exist
    mockItems.push(
      {
        content: '프로젝트 요구사항 정의',
        desc: '핵심 기능, 사용자 스토리, 기술 스펙 문서화',
        status: 'TODO',
        is_ai_generated: true,
        order: 2,
      },
      {
        content: 'MVP 기능 구현',
        desc: '최소 기능 제품에 포함될 핵심 기능 개발',
        status: 'TODO',
        is_ai_generated: true,
        order: 3,
      },
      {
        content: '사용자 피드백 수집',
        desc: '베타 테스트 및 사용자 피드백 분석',
        status: 'TODO',
        is_ai_generated: true,
        order: 4,
      }
    );
  }

  const summary = documentText.length > 100
    ? '비즈니스 프로젝트 기획서 (AI 분석 완료)'
    : '새 프로젝트 초기화';

  return {
    summary,
    tasks: mockItems,
  };
}

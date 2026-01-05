import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedTasksResult, Task } from '@/types';

// Initialize Google Generative AI (Gemini)
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

const EXTRACT_TASKS_PROMPT = `당신은 세계 최고의 프로젝트 매니저(PM)이자 개발 리드입니다.
다음 비즈니스 기획서(또는 프로젝트 설명)를 정밀 분석하여, 실제 개발 및 실행 단계에서 즉시 착수 가능한 구체적인 칸반 보드용 To-Do 리스트를 생성해 주세요.

목표: 기획상의 아이디어를 "실행 가능한(Actionable)" 단위의 태스크로 완벽하게 분해하는 것.

요구사항:
1. 프로젝트의 핵심 '한 줄 요약(summary)'을 작성하세요.
2. 기획서를 바탕으로 5개 ~ 10개의 구체적인 태스크(Tasks)를 추출하세요. (너무 적으면 안 됨)
3. 각 태스크는 추상적이지 않고, 기술적/실무적으로 구체적이어야 합니다.
   - 나쁜 예: "개발 시작", "기획서 작성"
   - 좋은 예: "Next.js 프로젝트 초기 세팅 및 Dockerfile 구성", "피그마 UI 디자인 시스템 토큰 정의"
4. 태스크의 순서는 논리적인 타임라인(기획 -> 디자인 -> 개발 -> 배포)을 따르세요.

반환 포맷 (JSON):
{
  "summary": "프로젝트의 핵심 목표 요약 (50자 이내)",
  "tasks": [
    {
      "content": "태스크 제목 (핵심만 간결하게, 20자 내외, 명사형 종결이나 동사형)",
      "desc": "구체적인 실행 가이드. 무엇을(What), 어떻게(How) 해야 할지 상세히 기술. 기술 스택이나 구체적 방법론 포함.",
      "status": "TODO",
      "is_ai_generated": true,
      "order": 0
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
      model: 'gemini-2.5-pro', // Use Gemini 3 Pro for higher quality analysis
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
      model: 'gemini-1.5-flash',
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

  // Generate mock tasks based on document content keywords
  const mockTasks: Omit<Task, 'id' | 'project_id' | 'created_at'>[] = [];
  const keywords = documentText.toLowerCase();

  // Basic keyword-based task generation
  if (keywords.includes('design') || keywords.includes('디자인')) {
    mockTasks.push({
      content: '디자인 시스템 구축',
      desc: 'UI 컴포넌트 라이브러리와 디자인 가이드라인 정의',
      status: 'TODO',
      is_ai_generated: true,
      order: mockTasks.length,
    });
  }

  if (keywords.includes('develop') || keywords.includes('개발') || keywords.includes('code')) {
    mockTasks.push({
      content: '개발 환경 설정',
      desc: '프로젝트 초기 설정, 의존성 설치, 저장소 구성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockTasks.length,
    });
  }

  if (keywords.includes('test') || keywords.includes('테스트')) {
    mockTasks.push({
      content: '테스트 계획 수립',
      desc: '단위 테스트, 통합 테스트, 사용자 테스트 계획 작성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockTasks.length,
    });
  }

  if (keywords.includes('deploy') || keywords.includes('배포')) {
    mockTasks.push({
      content: '배포 파이프라인 구축',
      desc: 'CI/CD 설정 및 배포 환경 구성',
      status: 'TODO',
      is_ai_generated: true,
      order: mockTasks.length,
    });
  }

  // Default tasks if no keywords matched
  if (mockTasks.length === 0) {
    mockTasks.push(
      {
        content: '프로젝트 요구사항 정의',
        desc: '핵심 기능, 사용자 스토리, 기술 스펙 문서화',
        status: 'TODO',
        is_ai_generated: true,
        order: 0,
      },
      {
        content: 'MVP 기능 구현',
        desc: '최소 기능 제품에 포함될 핵심 기능 개발',
        status: 'TODO',
        is_ai_generated: true,
        order: 1,
      },
      {
        content: '사용자 피드백 수집',
        desc: '베타 테스트 및 사용자 피드백 분석',
        status: 'TODO',
        is_ai_generated: true,
        order: 2,
      }
    );
  }

  const summary = documentText.length > 100
    ? '비즈니스 프로젝트 기획서 (AI 분석 완료)'
    : '새 프로젝트 초기화';

  return {
    summary,
    tasks: mockTasks,
  };
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedTasksResult, Task } from '@/types';

// Initialize Google Generative AI (Gemini)
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

const EXTRACT_TASKS_PROMPT = `다음 비즈니스 기획서를 분석해서:

1. 프로젝트의 핵심 목표를 한 줄로 요약
2. 즉시 실행 가능한 Action Item들을 JSON 태스크 목록으로 추출

각 태스크는 다음을 포함해야 해:
- content: 간결한 행동 중심의 제목 (동사로 시작)
- desc: 무엇을 해야 하는지 상세 설명
- status: 모든 새 태스크는 "TODO"
- is_ai_generated: true
- order: 0부터 시작하는 순차 번호

다음 JSON 형식으로 정확히 응답해:
{
  "summary": "프로젝트 요약 한 문장",
  "tasks": [
    {
      "content": "개발 환경 설정",
      "desc": "Node.js 설치, IDE 설정, 저장소 클론",
      "status": "TODO",
      "is_ai_generated": true,
      "order": 0
    }
  ]
}

중요: JSON 외에 다른 텍스트 없이 JSON만 반환해.

문서 내용:
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
      model: 'gemini-3-flash', // Use Gemini 3 Pro for higher quality analysis
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
      model: 'gemini-3.0-pro',
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

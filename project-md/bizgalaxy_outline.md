# 🚀 Project Plan: BizGalaxy (비즈갤럭시)

## 1. 프로젝트 개요 (Overview)

**BizGalaxy**는 텍스트 기반의 복잡한 업무 리스트를 **'시각적인 우주(Galaxy)'**로 변환하여 관리하는 차세대 생산성 플랫폼입니다.

* **Project Name**: BizGalaxy
* **Target User**: 다수의 사업/프로젝트를 동시에 관리하는 연쇄 창업가, PM, 프리랜서
* **Core Concept**:
  1.  **Visual Scaling**: 텍스트 목록 대신 마인드맵을 사용하며, 사업의 규모(Scale)가 클수록 노드의 크기가 커지는 직관적 인터페이스 제공.
  2.  **AI Automation (Zero-Setup)**: 기획서(PDF/MD) 업로드 시 AI가 내용을 분석하여 자동으로 칸반 보드와 To-Do List를 생성.

---

## 2. 기술 스택 (Tech Stack)

Claude Code IDE 환경에서의 개발 생산성과 GCP 배포 최적화를 고려한 스택 선정입니다.

### 2.1 Frontend (Next.js Ecosystem)

* **Framework**: **Next.js 14+ (App Router)**
  * *Reason*: SEO 최적화 및 React Server Components(RSC) 활용.
* **UI Library**: **Shadcn/ui** (Tailwind CSS 기반)
  * *Reason*: AI 에이전트가 코드를 생성하고 수정하기에 가장 용이하며 커스터마이징이 유연함.
* **Visualization**: **React Flow**
  * *Role*: 마인드맵 구현. 노드의 `style` 속성을 데이터와 바인딩하여 크기 동적 조절.
* **State Management**: **Zustand**
  * *Reason*: Redux 대비 보일러플레이트가 적고 가벼움.
* **Kanban / DnD**: **dnd-kit**
  * *Reason*: 모바일 터치 지원 및 접근성이 뛰어난 드래그 앤 드롭 라이브러리.

### 2.2 Backend & Infrastructure (GCP)

* **Deploy**: **Google Cloud Run**
  * *Role*: Next.js 애플리케이션의 컨테이너 기반 서버리스 배포.
* **Database**: **Firebase Firestore**
  * *Reason*: 마인드맵의 계층형 구조(Tree)와 칸반의 실시간성 처리에 적합한 NoSQL.
* **AI Engine**: **Vertex AI (Gemini Pro)**
  * *Role*: 문서 파싱, 요약, Action Item 추출.
* **Storage**: **Firebase Storage**
  * *Role*: 사용자가 업로드한 기획서(PDF/MD) 저장.

---

## 3. 주요 기능 명세 (Feature Specifications)

### 3.1 Galaxy View (Dynamic Mindmap)

* **UI Layout**:
  * 사용자를 중심으로 카테고리(위성) -> 개별 사업(행성)으로 뻗어나가는 구조.
  * 기본 Dark Mode 적용 (우주 컨셉).
* **Scale Visualization Logic**:
  * 사업 생성 시 입력된 `project_scale` (1~10) 값에 비례하여 노드의 `width`, `height` 렌더링.
  * *Example*: 사이드 프로젝트(Lv.1)는 50px, 메인 법인(Lv.10)은 300px.
* **Interaction**:
  * Zoom In/Out, Panning 지원.
  * 빈 공간 클릭 시 신규 사업 추가 모달 진입.

### 3.2 Immersive Kanban Board

* **Transition**:
  * 마인드맵 노드 클릭 시, 화면이 해당 노드로 Zoom-in 되며 칸반 보드 오버레이 활성화.
* **Structure**:
  * 기본 컬럼: `To Do` / `In Progress` / `Done`
  * 카드 이동: Drag & Drop 지원.

### 3.3 Doc-to-Task Engine (AI)

* **Workflow**:

  1. 사용자가 사업 추가 시 **[기획서 업로드]** 영역에 파일(PDF, MD) 드롭.

  2. **Server Action**: 파일을 텍스트로 파싱 (LangChain.js 활용).

  3. **Vertex AI Prompting**:

     > "이 문서를 분석해서 프로젝트의 핵심 목표를 1줄로 요약하고, 즉시 실행 가능한 Action Item을 추출하여 JSON 포맷의 Task List로 반환해줘."

  4. **Result**: 생성된 Task들이 Firestore의 `tasks` 컬렉션에 자동 저장되며 칸반 보드에 즉시 반영.

---

## 4. 데이터 구조 예시 (Firestore Schema)

```json
// projects (Collection)
{
  "project_id": "p_001",
  "uid": "user_123",
  "title": "BizGalaxy 개발",
  "scale": 9, // 노드 크기 결정 (1~10)
  "category": "Software",
  "summary": "AI 기반 생산성 도구 개발",
  "created_at": "Timestamp"
}

// tasks (Sub-collection of projects)
{
  "task_id": "t_101",
  "status": "TODO", // TODO, IN_PROGRESS, DONE
  "content": "Next.js 초기 환경 세팅",
  "desc": "Shadcn/ui 설치 및 테마 설정",
  "is_ai_generated": true
}
```
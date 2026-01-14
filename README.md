# 비즈갤럭시 (BizGalaxy) 🌌

**비즈갤럭시**는 우주와 행성의 메타포를 활용한 신개념 **시각적 생산성 플랫폼**입니다.
프로젝트를 직관적인 행성으로 시각화하고, AI를 통해 업무 효율을 극대화합니다.

## ✨ 주요 기능

- **🪐 갤럭시 뷰 (Galaxy View)**
  - 프로젝트를 우주 공간의 행성으로 시각화 (React Flow 활용)
  - 직관적인 마인드맵 스타일의 인터페이스
  - 줌 인/아웃 및 패닝을 통한 광활한 작업 공간 탐색

- **📋 몰입형 칸반 보드 (Kanban Board)**
  - 각 행성(프로젝트) 클릭 시 등장하는 Glassmorphism 스타일의 칸반 보드
  - 부드러운 드래그 앤 드롭 (Drag & Drop) 태스크 관리
  - '할 일', '진행 중', '완료' 상태 관리

- **🚀 AI 런치패드 (AI Launchpad)**
  - **Google Gemini Pro** 기반의 지능형 프로젝트 생성
  - 아이디어 텍스트나 PDF 문서를 분석하여 자동으로 프로젝트 구조 및 태스크 제안
  - 원클릭으로 프로젝트 행성 발사(생성)

- **👥 팀 센터 (Team Center)**
  - **팀원별 일정 관리**: 팀원을 추가하고 개별 근무 형태(정상/유연/오후/휴가)를 지정
  - **대형 캘린더 뷰**: 95vw 대형 화면으로 월간 팀 일정을 한눈에 파악
  - **스마트 일괄 설정**: 클릭 한 번으로 한 달 치 근무 일정을 자동 채우기(주말 제외)
  - **공휴일 자동 반영**: 한국 공휴일 및 대체 공휴일 완벽 지원

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Components**: Radix UI

### Libraries
- **Visuals**: React Flow (`@xyflow/react`)
- **Drag & Drop**: dnd-kit (`@dnd-kit/core`)
- **Icons**: Lucide React
- **PDF Parsing**: pdf-parse

### Backend & AI
- **AI**: Google Generative AI SDK (Gemini)
- **Database/Auth**: Firebase (Firestore, Auth)

### DevOps
- **Container**: Docker
- **Deployment**: Google Cloud Platform (Cloud Run)

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 이상
- npm 또는 yarn/pnpm
- Firebase 프로젝트 (Firestore, Auth 활성화)
- Google Cloud 계정 (배포 시)

### 1. 저장소 클론 및 설치
```bash
git clone [repository-url]
cd bizgalaxy
npm install
```

### 2. 환경 변수 설정
루트 디렉토리에 `.env.local` 파일을 생성하고 다음 변수들을 설정해주세요.

```bash
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI (선택 - AI 기능 사용 시)

GEMINI_API_KEY=your_gemini_api_key
```

### 3. Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. **Firestore Database** 생성 → 프로덕션 모드 시작
3. **Authentication** 활성화 → 이메일/비밀번호 제공업체 활성화
4. **Storage** 활성화 (PDF 문서 업로드용)
5. 프로젝트 설정에서 앱 추가 → 구성 값 복사하여 `.env.local`에 붙여넣기

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 📖 사용 방법

### 회원가입 및 로그인
1. 시작 페이지에서 "회원가입" 클릭
2. 이메일과 비밀번호 입력 후 계정 생성
3. Firebase Authentication을 통해 자동 로그인

### 🪐 갤럭시 뷰 사용법

**프로젝트(행성) 추가**
- 우주 공간의 빈 영역을 **더블 클릭**하면 새 프로젝트 생성 모달이 표시됩니다.
- 프로젝트 이름, 카테고리, 규모(1-10)를 입력하고 생성을 클릭하세요.

**프로젝트 규모 (Scale)**
- 규모에 따라 행성 크기가 다르게 표시됩니다:
  - **Lv.1-3**: 사이드 프로젝트 (작은 행성)
  - **Lv.4-7**: 일반 비즈니스 (중간 행성)
  - **Lv.8-10**: 메인 프로젝트 (대형 행성)

**네비게이션**
- **마우스 휠**: 줌 인/아웃
- **마우스 드래그**: 화면 패닝
- **행성 클릭**: 해당 프로젝트의 칸반 보드 열기

### 📋 칸반 보드 사용법

**태스크 관리**
- 행성을 클릭하면 해당 프로젝트의 칸반 보드가 열립니다.
- 기본 컬럼: `할 일` → `진행 중` → `완료`

**태스크 추가**
1. 각 컬럼 하단의 `+ 태스크 추가` 버튼 클릭
2. 태스크 제목과 설명 입력
3. 엔터 또는 추가 버튼 클릭

**태스크 이동**
- 태스크 카드를 드래그하여 다른 컬럼으로 이동
- dnd-kit을 통해 부드러운 애니메이션 지원

**태스크 수정/삭제**
- 태스크 카드의 수정/삭제 아이콘을 클릭하여 관리

### 🚀 AI 런치패드 사용법

**AI 기반 프로젝트 생성**
1. 좌측 사이드바 또는 새 프로젝트 생성에서 "AI 런치패드" 선택
2. 아이디어를 텍스트로 입력하거나 PDF 문서 업로드
3. AI가 자동으로 분석하여:
   - 프로젝트 개요 요약
   - 실행 가능한 태스크 리스트 추출
   - 카테고리 및 규모 제안
4. "프로젝트 생성" 버튼 클릭으로 즉시 행성 발사

**지원 파일 형식**
- 텍스트 입력 (직접 아이디어 작성)
- PDF 문서 (사업계획서, 기획서 등)
- Markdown 파일 (.md)

### 👥 팀 센터 사용법

**팀원 추가**
1. 팀 센터 페이지 접속
2. "팀원 추가" 버튼 클릭
3. 팀원 이름과 이메일 입력

**근무 형태 설정**
각 팀원의 날짜별 근무 형태를 지정할 수 있습니다:
- **정상 (Normal)**: 일반 근무일
- **유연 (Flexible)**: 유연 근무제
- **오후 (Afternoon)**: 오후 반차
- **휴가 (Vacation)**: 연차/휴가

**스마트 일괄 설정**
- 팀원 카드의 "일괄 설정" 버튼 클릭
- 한 달 치 근무 일정을 주말 제외하고 자동으로 "정상"으로 채움
- 공휴일은 자동으로 제외됨

**대형 캘린더 뷰**
- 95vw 너비의 대형 캘린더로 전체 팀 일정 한눈에 확인
- 날짜 클릭으로 개별 근무 형태 수정 가능

## 🗂 프로젝트 구조

```
bizgalaxy/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # 리액트 컴포넌트
│   │   ├── ui/          # Shadcn/ui 기반 UI 컴포넌트
│   │   ├── galaxy/      # 갤럭시 뷰 (React Flow)
│   │   ├── kanban/      # 칸반 보드 (dnd-kit)
│   │   └── ai/          # AI 관련 컴포넌트
│   ├── lib/             # 유틸리티 및 API 클라이언트
│   │   ├── firebase.ts  # Firebase 초기화
│   │   └── gemini.ts    # Gemini AI API
│   ├── store/           # Zustand 스토어
│   └── types/           # TypeScript 타입 정의
├── public/              # 정적 파일
└── .env.local          # 환경 변수 (직접 생성)
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix
```

## ☁️ 배포 (Google Cloud Run)

이 프로젝트는 **Google Cloud Run**에 최적화되어 있습니다.

### 배포 명령어
```bash
# Docker 이미지 빌드 및 배포
gcloud run deploy bizgalaxy --source . --region asia-northeast3 --allow-unauthenticated
```

### 배포 전 체크리스트
- [ ] `.env.local`의 모든 변수가 설정되었는지 확인
- [ ] Firebase Firestore 규칙이 프로덕션용으로 설정되었는지 확인
- [ ] `npm run build`가 성공적으로 완료되는지 확인

자세한 배포 가이드는 `.agent/workflows/deploy_to_gcp.md` 파일을 참고하세요.

## 🤝 기여

기여는 환영합니다! 이슈를 생성하거나 Pull Request를 제출해주세요.

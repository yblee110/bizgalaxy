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

## 🏁 시작하기

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
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## ☁️ 배포 (Google Cloud Run)

이 프로젝트는 **Google Cloud Run**에 최적화되어 있습니다.

### 배포 명령어
```bash
# Docker 이미지 빌드 및 배포
gcloud run deploy bizgalaxy --source . --region asia-northeast3 --allow-unauthenticated
```

자세한 배포 가이드는 `.agent/workflows/deploy_to_gcp.md` 파일을 참고하세요.

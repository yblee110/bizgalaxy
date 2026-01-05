---
description: Deploy BizGalaxy Application
---

# Deploy BizGalaxy

비즈갤럭시 애플리케이션을 배포하는 가장 쉽고 권장되는 방법은 **Vercel**을 사용하는 것입니다. Next.js를 만든 팀이 운영하는 플랫폼이므로 호환성이 가장 좋습니다.

## 1. 사전 준비

프로젝트가 빌드 가능한지 확인합니다 (이미 확인됨).
```bash
npm run build
```

## 2. Vercel로 배포하기 (CLI 사용)

Vercel CLI를 사용하여 터미널에서 바로 배포할 수 있습니다.

1.  **Vercel 로그인 (최초 1회)**
    ```bash
    // turbo
    npx vercel login
    ```
    이메일, GitHub 등으로 로그인하라는 메시지가 브라우저에 뜹니다.

2.  **프로젝트 배포**
    ```bash
    // turbo
    npx vercel
    ```
    
    실행 후 다음과 같은 질문들이 나옵니다. 대부분 기본값(Enter)을 선택하면 됩니다.
    *   **Set up and deploy "~"**: `Y` (Yes)
    *   **Which scope do you want to deploy to?**: (본인 계정 선택)
    *   **Link to existing project?**: `N` (No)
    *   **What's your project's name?**: `bizgalaxy` (또는 원하는 이름)
    *   **In which directory is your code located?**: `./` (기본값)
    *   **Want to modify these settings?**: `N` (No)

3.  **배포 완료 확인**
    배포가 완료되면 `Production: https://bizgalaxy-....vercel.app` 형태의 URL이 출력됩니다. 해당 주소로 접속하여 확인합니다.

## 3. 프로덕션(Production) 배포

위 단계의 `npx vercel`은 "Preview" 배포입니다. 최종 운영 환경으로 배포하려면 `--prod` 옵션을 붙입니다.
```bash
npx vercel --prod
```

---

## (옵션) 환경 변수 설정

`.env.local`에 있는 Firebase나 API 키 등이 있다면 Vercel 대시보드 또는 CLI로 설정해야 합니다.

```bash
npx vercel env add [변수명]
```
또는 Vercel 웹사이트 Project Settings > Environment Variables 메뉴에서 추가하세요.
주요 변수:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `GOOGLE_GENERATIVE_AI_API_KEY`
등 `.env.local`에 있는 값들을 모두 옮겨주세요.

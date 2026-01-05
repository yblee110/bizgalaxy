---
description: GitHub에 프로젝트 업로드하기
---

# GitHub에 프로젝트 올리기

이 가이드는 현재 로컬 프로젝트를 GitHub 저장소에 안전하게 업로드하는 방법을 설명합니다.

## 1. 사전 보안 점검 (이미 완료됨)
- `.gitignore` 파일에 `.env` 관련 파일들이 포함되어 있는지 확인했습니다.
- 소스 코드에 하드코딩된 비밀번호나 API 키가 없는지 확인했습니다.

## 2. GitHub 저장소 생성
1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단의 `+` 아이콘을 클릭하고 **"New repository"**를 선택합니다.
3. 설정을 입력합니다:
   - **Repository name**: `bizgalaxy` (또는 원하는 이름)
   - **Description**: (선택 사항)
   - **Public/Private**: 원하는 공개 범위 선택
   - **Initialize this repository with**: 아무것도 체크하지 마세요 (이미 로컬에 코드가 있으므로).
4. **Create repository** 버튼을 클릭합니다.

## 3. 로컬 프로젝트 연결 및 푸시
터미널에서 다음 명령어를 순서대로 실행하세요. `[YOUR_GITHUB_USERNAME]` 부분을 본인의 GitHub 아이디로 바꿔야 합니다.

```bash
# 1. git 초기화 (이미 되어 있다면 생략 가능하지만 안전을 위해 확인)
git init

# 2. 모든 변경사항 스테이징
git add .

# 3. 커밋 생성
git commit -m "Initial commit: BizGalaxy project structure"

# 4. 기본 브랜치 이름을 main으로 설정
git branch -M main

# 5. 원격 저장소 연결 (Github에서 복사한 주소 사용)
# 예: https://github.com/leeyb/bizgalaxy.git
git remote add origin https://github.com/[YOUR_GITHUB_USERNAME]/bizgalaxy.git

# 6. GitHub로 푸시
git push -u origin main
```

## 4. 문제 해결
- **"remote origin already exists" 에러**:
  이미 연결된 저장소가 있다는 뜻입니다. 기존 연결을 삭제하고 다시 연결하려면:
  ```bash
  git remote remove origin
  git remote add origin [새_REPO_주소]
  ```

- **로그인 창이 뜨는 경우**:
  GitHub 자격 증명을 입력하거나, 브라우저를 통해 인증하세요.

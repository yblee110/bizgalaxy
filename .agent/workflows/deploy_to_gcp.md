---
description: Google Cloud Platform (Cloud Run) 배포 가이드
---

# Google Cloud Run 배포 가이드

이 가이드는 Next.js 애플리케이션을 Google Cloud Run에 배포하는 방법을 설명합니다.

## 전제 조건
1. Google Cloud Platform 계정이 있어야 합니다.
2. 새 프로젝트를 생성하거나 기존 프로젝트를 사용해야 합니다.
3. 로컬 컴퓨터에 [gcloud CLI](https://cloud.google.com/sdk/docs/install)가 설치되어 있어야 합니다.

## 배포 단계

1. **Google Cloud 인증**
   터미널에서 아래 명령어를 실행하여 로그인합니다.
   ```bash
   gcloud auth login
   ```

2. **프로젝트 설정**
   배포할 GCP 프로젝트 ID를 설정합니다. (ID는 GCP 콘솔에서 확인 가능)
   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```

3. **필요한 서비스 활성화**
   Cloud Run과 Cloud Build 서비스를 활성화합니다.
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

4. **애플리케이션 배포**
   아래 명령어로 배포를 시작합니다. 소스 코드에서 직접 빌드하여 배포합니다.
   - `--source .`: 현재 디렉토리의 소스를 사용 (Dockerfile 자동 감지)
   - `--region asia-northeast3`: 서울 리전 사용 (필요시 변경 가능)
   - `--allow-unauthenticated`: 외부 접속 허용
   
   ```bash
   gcloud run deploy bizgalaxy --source . --region asia-northeast3 --allow-unauthenticated
   ```

5. **배포 확인**
   배포가 완료되면 터미널에 출력된 `Service URL`로 접속하여 확인합니다.

---
**참고**: `next.config.ts`에 `output: 'standalone'` 설정과 `Dockerfile`은 이미 생성해 두었습니다.

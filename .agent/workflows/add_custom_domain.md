---
description: Cloud Run 서비스에 커스텀 도메인 연결하기
---

# Cloud Run 커스텀 도메인 연결 가이드

Google Cloud Run에서 제공하는 기본 URL(`*.run.app`) 대신 보유한 도메인(예: `example.com`)을 연결하는 방법입니다.

## 방법 1: Google Cloud Console 사용 (권장)
가장 쉽고 직관적인 방법입니다.

1. **[Google Cloud Console - Cloud Run]** 페이지로 이동합니다.
2. `bizgalaxy` 서비스가 있는 리전(**asia-northeast3**)을 확인합니다.
3. 상단 메뉴에서 **"커스텀 도메인 관리(Manage Custom Domains)"** 버튼을 클릭합니다.
4. **"매핑 추가(Add Mapping)"**를 클릭합니다.
   - **서비스**: `bizgalaxy` 선택
   - **대상 도메인**: 연결할 도메인 선택 또는 "새 도메인 확인" 선택
5. **도메인 소유권 확인** (처음 연결 시):
   - Google Webmaster Central의 안내에 따라 도메인 DNS에 `TXT 레코드`를 추가하여 소유권을 인증합니다.
6. **DNS 레코드 업데이트**:
   - 매핑이 생성되면 Google에서 제공하는 `A 레코드` (IPv4) 및 `AAAA 레코드` (IPv6) 값을 확인합니다.
   - 도메인 등록 업체(가비아, 후이즈, AWS Route53 등)의 DNS 설정 페이지에서 해당 레코드를 추가/수정합니다.
7. **완료 대기**:
   - DNS 전파 및 SSL 인증서 발급에 시간이 소요될 수 있습니다 (보통 15분~1시간).

---

## 방법 2: gcloud CLI 사용

터미널에서 명령어로 직접 연결할 수도 있습니다. (베타 기능)

1. **도메인 매핑 생성**:
   ```bash
   gcloud beta run domain-mappings create --service bizgalaxy --domain [YOUR_DOMAIN] --region asia-northeast3
   ```
   *(도메인 소유권이 확인되지 않은 경우, 소유권 확인 절차를 위한 안내가 표시됩니다)*

2. **DNS 레코드 확인**:
   ```bash
   gcloud beta run domain-mappings describe --domain [YOUR_DOMAIN] --region asia-northeast3
   ```
   출력된 결과의 `resourceRecords` 섹션에 있는 레코드 값을 도메인 관리 사이트에 등록합니다.

## 주의사항
- **HTTPS 인증서**: Cloud Run은 자동으로 관리형 SSL 인증서를 발급해줍니다. 별도로 구매할 필요가 없습니다.
- **DNS 전파**: DNS 설정을 변경한 후 실제 적용되기까지 최대 24-48시간이 걸릴 수 있으나, 보통은 더 빠릅니다.

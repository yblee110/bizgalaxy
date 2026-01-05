# 🎨 BizGalaxy UI/UX Design Specification

## 1. 디자인 테마: "Deep Cosmos"

사용자가 광활한 우주에서 자신의 프로젝트를 탐험하는 듯한 몰입감을 주는 다크 모드 전용 테마입니다.

### 1.1 Color Palette (Tailwind CSS 기준)
Shadcn/ui의 `globals.css` 변수에 매핑하여 사용할 수 있는 색상 코드입니다.

|      Role      |    Color Name    | Hex Code  | Usage                                          |
| :------------: | :--------------: | :-------: | :--------------------------------------------- |
| **Background** |   `Void Black`   | `#030712` | 전체 배경 (완전한 블랙보다는 아주 깊은 네이비) |
|  **Surface**   | `Stardust Grey`  | `#111827` | 카드, 사이드바 배경 (약간의 투명도 적용 권장)  |
|  **Primary**   | `Nebula Violet`  | `#7C3AED` | 메인 액션 버튼, 중요 행성(노드) 강조색         |
| **Secondary**  |   `Orbit Cyan`   | `#06B6D4` | 보조 버튼, 연결선, 정보성 뱃지                 |
|   **Accent**   | `Supernova Pink` | `#EC4899` | 알림, 에러, 강조 텍스트 (AI 액션 등)           |
|    **Text**    |  `White Dwarf`   | `#F9FAFB` | 기본 텍스트 (가독성 최우선)                    |
|   **Muted**    |   `Space Dust`   | `#6B7280` | 부가 설명, 비활성 요소                         |

### 1.2 Design Language: Glassmorphism (유리 질감)
우주 배경이 은은하게 비치도록 UI 요소에 반투명 효과를 적극 사용합니다.

* **Panel Style**: `bg-gray-900/40 backdrop-blur-md border border-white/10`
* **Shadow**: `shadow-[0_0_15px_rgba(124,58,237,0.5)]` (네온 글로우 효과)

### 1.3 Typography
* **Font Family**: `Inter` (기본 가독성) + `Rajdhani` (헤더/숫자 - SF 느낌)
* **Headings**: Bold, Tracking-tight (자간 좁게)

---

## 2. 화면별 레이아웃 명세 (Layout Specs)

### 2.1 Main Dashboard: Galaxy View (Home)

**📍 구조 (Structure)**
* **Canvas**: 화면 전체(`100vw`, `100vh`)를 차지하는 React Flow 영역.
* **Navigation (Overlay)**:
    * `Top-Left`: 로고 (Glass 패널)
    * `Top-Right`: 사용자 프로필 Avatar
    * `Bottom-Right`: **[+ New Project]** 플로팅 버튼 (FAB) - 가장 눈에 띄는 Primary Color 사용.
    * `Bottom-Left`: 줌/미니맵 컨트롤러.

**🪐 노드 디자인 (Planet Node)**
* **Shape**: 원형 (`rounded-full`).
* **Size**: 데이터의 `scale` 값(1~10)에 따라 `w-[60px]` ~ `w-[240px]` 동적 할당.
* **Effect**:
    * 기본: 은은한 테두리 (`border-2 border-primary/50`).
    * Hover: 노드 주변으로 빛이 퍼지는 `box-shadow` 애니메이션.
    * Label: 행성 중앙 또는 하단에 텍스트 배치.

---

### 2.2 Modal: Project Launchpad (Create)

**📍 구조 (Structure)**
* 화면 중앙에 뜨는 다이얼로그 모달. 뒷배경은 어둡게 처리 (`bg-black/80`).

**🛠 내부 컴포넌트**
1.  **Header**: "Launch New Project" (H2 타이틀).
2.  **Input Field**: 프로젝트 명 입력 (밑줄 스타일 Input).
3.  **Scale Slider**:
    * 좌우로 드래그하여 행성 크기 설정.
    * 슬라이더 움직임에 따라 상단 미리보기 행성(Preview Circle) 크기가 실시간 변화 (Animation).
4.  **Dropzone (File Upload)**:
    * 점선 테두리 박스 (`border-dashed`).
    * 파일 드롭 시: "Scanning Document..." 텍스트와 함께 스캔 효과 애니메이션 (좌우로 빛이 지나가는 효과).
5.  **Action Button**:
    * `[Launch 🚀]` 버튼. 업로드 완료 전엔 비활성(`opacity-50`), 완료 시 활성(`Primary Color`).

---

### 2.3 Detail View: Immersive Kanban (Overlay)

**📍 구조 (Structure)**
* 화면 전환이 아닌, 갤럭시는 그대로 두고 카메라가 해당 행성으로 줌인(Zoom-in) 되며 그 위에 **반투명 레이어(Sheet)**가 덮이는 방식.

**📋 칸반 보드 (Kanban Board)**
* **Layout**: 가로 스크롤 가능한 3단 컬럼 (`To Do`, `In Progress`, `Done`).
* **Column Style**:
    * 배경이 거의 없는 투명한 박스.
    * 헤더(`To Do` 등)에만 각기 다른 색상의 밑줄 포인트 (`Red`, `Yellow`, `Green`).
* **Card Style (Task Item)**:
    * `bg-gray-800/80` (불투명도 80%).
    * **AI Tag**: AI가 생성한 태스크는 카드 우측 상단에 ✨ 아이콘과 함께 `Purple` 텍스트로 표시.
    * **Interactions**: 드래그 시 카드가 살짝 기울어지거나(`rotate-2`), 그림자가 진해짐.

---

## 3. Tailwind CSS 설정 예시 (tailwind.config.ts)

위 테마를 적용하기 위해 `tailwind.config.ts`에 추가할 설정값입니다.

```typescript
import { fontFamily } from "tailwindcss/defaultTheme"

module.exports = {
  theme: {
    extend: {
      colors: {
        // Semantic Names
        background: "#030712", // Void Black
        foreground: "#F9FAFB", // White Dwarf
        primary: {
          DEFAULT: "#7C3AED", // Nebula Violet
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#06B6D4", // Orbit Cyan
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "rgba(17, 24, 39, 0.7)", // Glassmorphism base
          foreground: "#F9FAFB",
        },
        accent: {
          DEFAULT: "#EC4899", // Supernova Pink
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        tech: ["var(--font-rajdhani)", ...fontFamily.sans], // For headers/numbers
      },
      backgroundImage: {
        'galaxy-gradient': "radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)",
      }
    },
  },
}
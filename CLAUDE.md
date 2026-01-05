# Project Guide for Claude Code - BizGalaxy

**IMPORTANT** : Your output should be **ENGLISH**

## Overview
BizGalaxy is a visual productivity platform that transforms complex business task lists into an interactive "galaxy" universe. Users can manage multiple businesses/projects through a dynamic mindmap interface where node sizes reflect business scale.

## Commands
- **Run Server**: `npm run dev` (Runs on http://localhost:3000)
- **Build**: `npm run build`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Type Check**: `tsc --noEmit`

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
  - Rationale: SEO optimization and React Server Components (RSC)
- **Language**: TypeScript
- **UI Library**: Shadcn/ui (Tailwind CSS based)
  - Rationale: AI-friendly code generation and flexible customization
- **Visualization**: React Flow
  - Role: Mindmap implementation with dynamic node sizing based on `project_scale`
- **State Management**: Zustand
  - Rationale: Lightweight with minimal boilerplate compared to Redux
- **Kanban / DnD**: dnd-kit
  - Rationale: Mobile touch support and superior accessibility

### Backend & Infrastructure
- **Deployment**: Google Cloud Run
  - Role: Serverless container-based deployment for Next.js
- **Database**: Firebase Firestore
  - Rationale: NoSQL database suitable for hierarchical tree structures and real-time kanban updates
- **AI Engine**: Vertex AI (Gemini Pro)
  - Role: Document parsing, summarization, and Action Item extraction
- **Storage**: Firebase Storage
  - Role: Store uploaded planning documents (PDF/MD)

## Code Style Guidelines
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for components/interfaces.
- **Components**: Use Functional Components with named exports.
- **Typing**: Avoid `any`. Define interfaces for all props and API responses.
- **Imports**: Use absolute paths (`@/components/...`) instead of relative paths.
- **Comments**: Write JSDoc for complex logic only.

## Project Structure
- `src/app`: App router pages and layouts.
- `src/components/ui`: Reusable UI components (buttons, inputs) via Shadcn/ui.
- `src/components/visualization`: React Flow-based mindmap components.
- `src/components/kanban`: Kanban board with dnd-kit drag-and-drop.
- `src/lib`: Utility functions and API clients (Firebase, Vertex AI).
- `src/types`: Global type definitions for Firestore schemas.

## Important Context
- We use strict ESLint rules. Fix lint errors before finishing a task.
- When creating a new API endpoint, always add error handling (try-catch).
- Node sizes in the galaxy view are dynamically rendered based on `project_scale` (1-10).
- Dark mode is the default theme (universe/space concept).

## Key Features Implementation Notes

### Galaxy View (Dynamic Mindmap)
- User-centered structure: User → Categories (Satellites) → Individual Businesses (Planets)
- Scale visualization: `project_scale` value (1-10) determines node `width` and `height`
  - Example: Side project (Lv.1) = 50px, Main corporation (Lv.10) = 300px
- Interactions: Zoom In/Out, Panning, click empty space to add new business

### Immersive Kanban Board
- Transition: Clicking mindmap node triggers zoom-in animation and opens kanban overlay
- Default columns: `To Do` / `In Progress` / `Done`
- Drag & Drop via dnd-kit

### Doc-to-Task Engine (AI)
1. User uploads planning document (PDF/MD) when creating a business
2. Server Action: Parse file to text using LangChain.js
3. Vertex AI Prompt: "Analyze this document, summarize the core goal in 1 line, and extract immediately actionable Action Items as a JSON-formatted Task List."
4. Result: Generated tasks auto-save to Firestore `tasks` collection and reflect in kanban board

## Firestore Schema Reference

```typescript
// projects (Collection)
interface Project {
  project_id: string;
  uid: string;
  title: string;
  scale: number; // 1-10, determines node size
  category: string;
  summary: string;
  created_at: Timestamp;
}

// tasks (Sub-collection of projects)
interface Task {
  task_id: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  content: string;
  desc: string;
  is_ai_generated: boolean;
}
```
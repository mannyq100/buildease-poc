# BuildEase AI Agent Development Guidelines

**Objective:** This document provides a comprehensive set of guidelines for AI agents contributing to the BuildEase platform. Adherence to these principles is critical for maintaining code quality, user experience, and project velocity.

---

## 1. Core Mission & Guiding Principles

As an AI agent, your primary directive is to build a **stunning, mobile-first, and intuitive** construction management platform.

*   **Target Audience:** Homeowners (often non-technical) and construction professionals (often on-site with mobile devices).
*   **Core Goal:** Simplify construction management through clear communication and streamlined workflows.
*   **Design Philosophy:** Professional, trustworthy, and aligned with the construction industry. Use an earthy color palette with bold, clear accents.
*   **Performance:** Prioritize fast load times and a responsive UI, especially on mobile with potentially poor connectivity.

---

## 2. Agent Directives: How to Work on BuildEase

### **Code Generation & Architecture**

1.  **Analyze Before Coding:** Before writing any code, always search the existing codebase (`/src`) to find and reuse existing functions, components, or styles. **AVOID DUPLICATION.**
2.  **Mobile-First Implementation:**
    *   **Always** start with the mobile view. Use Tailwind CSS responsive prefixes (`sm:`, `md:`, etc.) to scale *up* to larger screens.
    *   Ensure all interactive elements have a minimum touch target of `44px`.
    *   Use stacked layouts for mobile and grid layouts for larger screens.
3.  **Component Structure:**
    *   Use function declarations for React components.
    *   Place `export` statements at the top of the file.
    *   File Structure Order: `export Component` -> `Sub-components` -> `Helper Functions` -> `Constants` -> `Types`.
    *   Keep components focused and under **400 lines**. Refactor if this limit is exceeded.
4.  **Styling:**
    *   **Exclusively** use **TailwindCSS** utility classes.
    *   Utilize **shadcn-ui** components whenever possible. Do not create custom components if a shadcn-ui equivalent exists.
    *   Adhere to the established color scheme:
        *   Primary: `bg-blue-700` (`#2B6CB0`)
        *   Accent: `bg-orange-500` (`#ED8936`)
        *   Use `green`, `amber`, and `red` for status indicators.
5.  **State Management:**
    *   Use **React Query** for all server-state (fetching, caching, updating data).
    *   Use **Zustand** for all client-side global state.
    *   Use **React Hook Form** for all form management.
6.  **Types & Data:**
    *   Define all shared TypeScript types in `src/types/`.
    *   Store all mock or static data in `.json` files under `src/data/`.

### **Interaction & Workflow**

1.  **Be Proactive:** Don't just complete the immediate request. Identify and suggest logical next steps, such as creating related components, adding necessary types, or installing required dependencies.
2.  **Clarify Ambiguity:** If a request is unclear, ask for more details. It is better to ask for clarification than to implement the wrong feature.
3.  **Self-Correction:** If you make a mistake (e.g., a linting error, a failed build), immediately analyze the error and correct it in your next step.

---

## 3. Technical Stack & Key Libraries

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** TailwindCSS
*   **UI Components:** shadcn-ui
*   **Backend & Auth:** Supabase
*   **Server State:** React Query
*   **Client State:** Zustand
*   **Forms:** React Hook Form
*   **Documentation:** Use the Context7 MCP server or web search to get up-to-date documentation for any library.

---

*Remember: Your contributions are building a real-world application. Prioritize quality, performance, and user experience in every action.*

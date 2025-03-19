# BuildEase UI - Construction Project Management Platform

## Project Overview

BuildEase is a comprehensive construction project management platform designed to streamline workflows, enhance collaboration, and provide powerful insights for construction professionals. This UI prototype demonstrates the core functionality and user experience of the platform.

## Project Scope

BuildEase aims to solve critical challenges in the construction industry by providing:

1. **Centralized Project Management**: A single source of truth for all project information, eliminating data silos and improving communication across stakeholders.

2. **Intelligent Resource Allocation**: AI-assisted planning tools for optimizing resource allocation including labor, materials, and equipment.

3. **Financial Visibility**: Real-time tracking of expenses, budgets, and financial forecasting to prevent cost overruns.

4. **Schedule Optimization**: Interactive scheduling tools with critical path analysis and dependency management.

5. **Document Control**: Version-controlled document management with approval workflows and compliance tracking.

6. **Quality Assurance**: Inspection checklists, issue tracking, and resolution workflows to maintain quality standards.

7. **Reporting & Analytics**: Customizable dashboards and reports providing actionable insights across all aspects of construction projects.

The current prototype focuses on demonstrating the user interface and core features, with plans to expand functionality and integrate with external systems in future versions.

## Key Features

- **Project Dashboard**: Centralized overview of all projects with key metrics and status indicators
- **Task Management**: Plan, assign, and track tasks throughout the construction lifecycle
- **Team Collaboration**: Manage team members, roles, and responsibilities
- **Schedule Management**: Interactive timeline views for project scheduling
- **Material Tracking**: Inventory management for construction materials
- **Document Management**: Store, organize, and version control project documents
- **Expense Management**: Track, categorize, and analyze project expenses with advanced features:
  - Data visualization with interactive charts
  - Budget tracking and forecasting
  - Expense categorization and insights
  - Receipt management with image preview
  - Batch operations for expense approval/rejection
  - Export functionality for reports
  - Scheduled reporting capabilities

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- React Router
- shadcn-ui components
- Tailwind CSS
- Recharts for data visualization
- Lucide React for icons
- React Query for data fetching

## Environment Configuration

BuildEase supports multiple deployment environments:

### Available Environments

- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Environment Configuration Files

The application uses environment-specific configuration files:

- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables

Example environment files (`.env.*.example`) are provided as templates. To set up your environments:

1. Copy the example files to create your actual environment files:
   ```sh
   cp .env.development.example .env.development
   cp .env.staging.example .env.staging
   cp .env.production.example .env.production
   ```

2. Update the variables in each file with your specific settings.

### Running in Different Environments

Development:
```sh
npm run dev          # Run development server
npm run build:dev    # Build for development
npm run deploy:dev   # Deploy to development (if configured)
```

Staging:
```sh
npm run dev:staging  # Run with staging configuration
npm run build:staging # Build for staging
npm run deploy:staging # Deploy to staging (if configured)
```

Production:
```sh
npm run build        # Build for production
npm run deploy:prod  # Deploy to production (if configured)
```

### Environment Variables

Key environment variables include:

- `VITE_API_URL`: Backend API endpoint
- `VITE_ENV`: Current environment name
- `VITE_APP_TITLE`: Application title (includes environment indicator in non-production)
- `VITE_USE_MOCK`: Whether to use mock data (true/false)
- `VITE_BASE_URL`: Base URL for the application
- `VITE_ANALYTICS_ID`: Analytics tracking ID (production only)

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd buildese-ui-poc

# Step 3: Install dependencies
npm install

# Step 4: Set up environment files
cp .env.development.example .env.development
# Edit .env.development with your settings

# Step 5: Start the development server
npm run dev
```

## Repository Structure

### Root Structure
```
buildese-ui-poc/
├── public/              # Static assets
├── src/                 # Source code
├── index.html           # Entry HTML file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
├── .env.development     # Development environment variables
├── .env.staging         # Staging environment variables
├── .env.production      # Production environment variables
└── README.md            # Project documentation
```

### Source Code Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Basic shadcn UI components (buttons, cards, etc.)
│   ├── shared/          # Shared components used across multiple pages
│   ├── layout/          # Layout components (headers, sidebars, etc.)
│   ├── navigation/      # Navigation-related components
│   ├── create-project/  # Components for project creation flow
│   └── generated-plan/  # Components for AI-generated planning
├── pages/               # Page components for different sections
│   ├── Dashboard.tsx    # Main dashboard page
│   ├── ProjectDetails.tsx # Project details page
│   ├── Expenses.tsx     # Expense management page
│   ├── Team.tsx         # Team management page
│   ├── Schedule.tsx     # Schedule management page
│   ├── Materials.tsx    # Materials tracking page
│   └── Documents.tsx    # Document management page
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
│   ├── utils.ts         # General utility functions
│   └── env-config.ts    # Environment configuration utilities
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

### Package Dependencies

The project uses a modern React stack with the following key dependencies:

- **UI Components**: shadcn UI components built on Radix UI primitives
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React hooks and context
- **Data Fetching**: React Query for server state management
- **Routing**: React Router for navigation
- **Data Visualization**: Recharts for charts and graphs
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icon library

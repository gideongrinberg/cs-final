# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Code Style Guidelines

- Component Naming: PascalCase for components (AppHeader, StockChart)
- Variables/Functions: camelCase for variables, functions, hooks (useAuth, fetchData)
- Types/Interfaces: PascalCase with descriptive names (StockChartProps, AuthContextType)
- Imports: React first, third-party libraries next, local imports last using @/ alias
- Component Organization: Functional components with TypeScript interfaces for props
- Error Handling: Try/catch blocks with toast notifications for user-facing errors
- Project Structure:
  - /components - UI components organized by feature
  - /contexts - React context providers 
  - /hooks - Custom React hooks
  - /pages - Route components
  - /services - API and data services
  - /utils - Utility functions

## Technologies
Vite, React, TypeScript, shadcn-ui, Tailwind CSS, Supabase
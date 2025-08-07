# Study Tracker Web Application

## Overview

Study Tracker is a modern web-based productivity application designed to help users manage their daily tasks, track progress, and maintain study focus. Originally a Python desktop application, it has been rebuilt as a full-stack web application using React, Express, and PostgreSQL. The application focuses on workflow-first design with features for task management, progress tracking, focus sessions, analytics, and data import/export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: 
  - Zustand for client-side state (focus timer, settings)
  - TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Theme System**: Light/dark mode toggle with persistent user preference

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with structured endpoints for tasks, focus sessions, analytics, and settings
- **Data Layer**: Repository pattern with in-memory storage implementation (prepared for database integration)
- **Validation**: Zod schemas shared between frontend and backend
- **File Handling**: Multer for CSV/Excel import functionality

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema**: Well-defined tables for tasks, focus sessions, and settings with proper relationships
- **Migrations**: Drizzle Kit for database schema management
- **Local Development**: In-memory storage fallback for development/testing

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Data Privacy**: All data operations are local/session-based
- **Future Ready**: Structure prepared for user authentication integration

### Component Architecture
- **Design System**: Consistent component library with variants and themes
- **Reusable Components**: Modular UI components (TaskCard, FocusTimer, AnalyticsChart)
- **Modal System**: Structured dialogs for task creation, progress logging, and settings
- **Layout System**: Sidebar navigation with responsive design considerations

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### UI and Styling
- **Radix UI**: Comprehensive primitive component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management

### Data Visualization and Charts
- **Recharts**: React charting library for analytics dashboards
- **Chart Types**: Circular progress charts, bar charts, line charts for different time periods

### Data Processing
- **Papa Parse**: CSV parsing and processing for data import
- **SheetJS (XLSX)**: Excel file reading and writing capabilities
- **Date-fns**: Date manipulation and formatting utilities

### Development and Build Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type safety across the entire application
- **Replit Integration**: Development environment optimizations

### Form and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime type validation and schema generation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight client-side state management with persistence

The application is designed to be offline-first with all core functionality working without external dependencies, while providing integration capabilities for future enhancements like Google Calendar sync and email reporting.
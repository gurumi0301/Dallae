# Overview

This is a mental health support mobile application called "마음담기" (Maeum-damgi) - an anonymous, AI-powered emotional support platform. The application provides a safe space for users to share their feelings, receive comfort, and connect with others without revealing their identity.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI primitives with custom theming
- **Build Tool**: Vite with custom mobile-first configuration

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Real-time Communication**: WebSocket server for live chat features
- **Session Management**: Anonymous session-based authentication
- **AI Integration**: OpenAI GPT-4o for emotion analysis and comfort generation

## Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Schema**: Shared TypeScript schema definitions
- **Migrations**: Drizzle Kit for database migrations

# Key Components

## Anonymous User System
- Auto-generated Korean animal/adjective names (e.g., "따뜻한 달팽이")
- Session-based identification without personal data collection
- Secure session ID generation and storage

## Emotion Analysis & AI Support
- Real-time emotion detection from user text using OpenAI
- Contextual comfort message generation
- Crisis content detection and appropriate response routing
- Multi-layered content filtering system

## Core Features
1. **Anonymous Chat**: Real-time 1:1 matching system
2. **Emotion Diary**: Daily mood tracking with gratitude journaling
3. **AI Comfort**: Immediate emotional support responses
4. **Statistics Dashboard**: Personal emotional trend visualization

## Mobile-First Design
- Responsive design optimized for mobile screens (max-width: 428px)
- Touch-friendly UI with bottom navigation
- Progressive Web App capabilities
- Smooth animations and transitions

# Data Flow

## User Journey
1. **Onboarding**: First-time users see welcome screen
2. **Anonymous Registration**: Auto-creation of anonymous identity
3. **Emotion Selection**: Quick mood check-in on home screen
4. **Feature Access**: Navigate between chat, diary, and stats
5. **Real-time Interaction**: Live chat matching and AI responses

## Data Processing
1. **Content Filtering**: Two-tier filtering (keyword-based + AI)
2. **Emotion Analysis**: Text → OpenAI → Structured emotion data
3. **Real-time Updates**: WebSocket for chat, polling for updates
4. **Data Persistence**: All interactions stored with privacy focus

# External Dependencies

## AI Services
- **OpenAI GPT-4o**: Primary AI model for emotion analysis and comfort generation
- **Custom Prompts**: Korean-language optimized prompts for cultural context

## Database & Hosting
- **Neon Database**: Serverless PostgreSQL for production
- **Replit Infrastructure**: Development and potential deployment platform

## Frontend Libraries
- **React Ecosystem**: React Query, React Router (Wouter), React Hook Form
- **UI Framework**: Radix UI + Tailwind CSS + shadcn/ui
- **Utilities**: date-fns, clsx, class-variance-authority

## Backend Dependencies
- **Express.js**: Web server framework
- **WebSocket**: Real-time communication
- **Drizzle ORM**: Type-safe database interactions

# Deployment Strategy

## Development Environment
- **Replit**: Primary development platform with hot reload
- **Vite Dev Server**: Frontend development with proxy to backend
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY

## Production Considerations
- **Build Process**: Separate frontend (Vite) and backend (esbuild) builds
- **Static Assets**: Frontend builds to dist/public
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: In-memory storage (consider Redis for scaling)

## Scaling Preparations
- WebSocket connection management for multiple users
- Database connection pooling for concurrent sessions
- Content moderation queue for high-volume filtering

# Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

# User Preferences

```
Preferred communication style: Simple, everyday language.
```
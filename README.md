# 🎓 CourseHub Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://it4beginner.vercel.app)

> **A modern, responsive frontend for the CourseHub online learning platform built with Next.js 15 and React 19**

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

CourseHub Frontend is a modern, responsive web application that provides an intuitive interface for online course management. Built with Next.js 15 and React 19, it offers a seamless learning experience for students, instructors, and administrators.

## ✨ Features

- 🎨 **Modern UI/UX** - Clean, responsive design with dark/light mode support
- 🔐 **Authentication** - Secure login with Google OAuth integration
- 📚 **Course Management** - Browse, enroll, and manage courses
- 📹 **Video Learning** - Interactive video player with progress tracking
- 💬 **Real-time Communication** - Live comments and discussions via WebSocket
- 📊 **Analytics Dashboard** - Course performance and learning analytics
- 💳 **Payment Integration** - Secure payment processing with SePay
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- 🌍 **Internationalization** - Multi-language support
- ♿ **Accessibility** - WCAG compliant with screen reader support
- 🚀 **Performance** - Optimized with SSR, lazy loading, and caching

## 🛠 Tech Stack

### Core Technologies
| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.2.4 |
| **Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4.17 |
| **State Management** | Zustand 5.0.5 |
| **Forms** | React Hook Form 7.54.1 |
| **HTTP Client** | Axios 1.9.0 |

### UI Components & Libraries
| Component | Library |
|-----------|---------|
| **UI Components** | Radix UI, Shadcn/ui |
| **Icons** | Lucide React |
| **3D Graphics** | Three.js, React Three Fiber |


## 📋 Prerequisites

Before running this application, make sure you have:

- 🟢 **Node.js 18** or higher
- 📦 **npm**, **yarn**, or **pnpm** package manager
- 🔧 **Git** for version control

## 🚀 Quick Start

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kl3inIT/course-hub-frontend.git
cd course-hub-frontend

# 2. Install dependencies
npm install
# or
yarn install
# or
pnpm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev

# 5. Open your browser
# Navigate to http://localhost:3000
```

### Additional Dependencies

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
# Production: https://api.coursehub.io.vn

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # TypeScript type checking
```

### Code Style

This project follows strict coding standards:

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework

### Component Development

```tsx
// Example component structure
import React from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  children: React.ReactNode
}

export const Component: React.FC<ComponentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {children}
    </div>
  )
}
```

## 🚀 Deployment

### Environment URLs

| Environment | Frontend URL | Backend URL |
|-------------|--------------|-------------|
| Development | `http://localhost:3000` | `http://localhost:8080` |
| Production | `https://it4beginner.vercel.app` | `https://api.coursehub.io.vn` |

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Manual Deployment

```bash
# Build the application
npm run build

# Export static files (if using static export)
npm run export

# Deploy the out/ folder to your hosting provider
```


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clean, readable TypeScript code
- Follow the existing code style and patterns
- Add proper TypeScript types for all props and functions
- Write unit tests for new components
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support and questions:
- 🌐 **Live Demo**: [https://it4beginner.vercel.app](https://it4beginner.vercel.app)
- 📖 **Documentation**: [Project Documentation](https://docs.google.com/document/d/1yS2gNY6gmu4iALd1iCFMwpMh6yIt_NF82NZSsYMsZ4w/edit?tab=t.0)
- 🐛 **Issues**: [GitHub Issues](https://github.com/kl3inIT/course-hub-frontend/issues)

---

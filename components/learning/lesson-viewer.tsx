'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Home,
  AlertCircle,
  RefreshCw,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { DiscussionSection } from './discussion-section'
import { useToast } from '@/components/ui/use-toast'

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'link' | 'video' | 'image'
  url: string
  size?: string
}

interface Lesson {
  id: string
  title: string
  description: string
  duration: number
  videoUrl?: string
  content: string
  resources: Resource[]
  completed: boolean
  order: number
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  completed: boolean
  order: number
  totalDuration: number
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  rating: number
  totalStudents: number
  modules: Module[]
  progress: number
  totalDuration: number
}

interface LessonViewerProps {
  courseId: string
  moduleId?: string
  lessonId?: string
}

// Enhanced mock data with proper module structure
const mockCourses: Record<string, Course> = {
  '1': {
    id: '1',
    title: 'Complete React Development Course',
    description:
      'Master React.js from fundamentals to advanced concepts with hands-on projects',
    instructor: 'Sarah Johnson',
    rating: 4.8,
    totalStudents: 1250,
    progress: 25,
    totalDuration: 480, // 8 hours
    modules: [
      {
        id: '1',
        title: 'React Fundamentals',
        description:
          'Learn the core concepts of React including components, JSX, and props',
        order: 1,
        completed: false,
        totalDuration: 120,
        lessons: [
          {
            id: '1',
            title: 'Introduction to React',
            description: 'What is React and why use it?',
            duration: 15,
            order: 1,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Introduction to React

React is a powerful JavaScript library for building user interfaces, particularly web applications. Created by Facebook (now Meta), React has revolutionized how we think about building interactive UIs.

## What Makes React Special?

### 1. Component-Based Architecture
React applications are built using components - reusable pieces of code that manage their own state and render UI elements.

### 2. Virtual DOM
React uses a virtual representation of the DOM to optimize rendering performance, making updates faster and more efficient.

### 3. Declarative Programming
Instead of telling React how to update the UI, you describe what the UI should look like for any given state.

## Key Benefits

- **Reusability**: Write once, use anywhere
- **Performance**: Virtual DOM optimization
- **Developer Experience**: Great tooling and debugging
- **Community**: Large ecosystem and community support

## Getting Started

To start with React, you'll need:
1. Node.js installed on your computer
2. A code editor (VS Code recommended)
3. Basic knowledge of JavaScript and HTML

Let's dive into creating your first React component!`,
            resources: [
              {
                id: '1',
                title: 'React Official Documentation',
                type: 'link',
                url: 'https://reactjs.org/docs',
              },
              {
                id: '2',
                title: 'React Setup Guide',
                type: 'pdf',
                url: '/setup-guide.pdf',
                size: '2.5 MB',
              },
            ],
            completed: true,
          },
          {
            id: '2',
            title: 'Setting Up Your Development Environment',
            description: 'Install and configure tools for React development',
            duration: 20,
            order: 2,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Setting Up Your Development Environment

A proper development environment is crucial for productive React development. Let's set up everything you need.

## Required Tools

### 1. Node.js and npm
Node.js is required to run React development tools and manage packages.

\`\`\`bash
# Check if Node.js is installed
node --version
npm --version
\`\`\`

### 2. Code Editor
We recommend Visual Studio Code with these extensions:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag

### 3. Browser Developer Tools
Install React Developer Tools extension for Chrome or Firefox.

## Creating Your First React App

\`\`\`bash
# Create a new React application
npx create-react-app my-first-app
cd my-first-app
npm start
\`\`\`

## Project Structure

Understanding the default project structure:
- \`public/\` - Static files
- \`src/\` - Source code
- \`package.json\` - Dependencies and scripts
- \`README.md\` - Project documentation

Your development environment is now ready!`,
            resources: [
              {
                id: '3',
                title: 'VS Code Extensions List',
                type: 'doc',
                url: '/vscode-extensions.docx',
                size: '1.2 MB',
              },
              {
                id: '4',
                title: 'Node.js Download',
                type: 'link',
                url: 'https://nodejs.org/',
              },
            ],
            completed: false,
          },
          {
            id: '3',
            title: 'Your First React Component',
            description: 'Create and understand React components',
            duration: 25,
            order: 3,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Your First React Component

Components are the building blocks of React applications. Let's create your first component and understand how it works.

## What is a Component?

A React component is a JavaScript function or class that returns JSX (JavaScript XML) to describe what should appear on the screen.

## Functional Components

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## JSX Syntax

JSX allows you to write HTML-like syntax in JavaScript:

\`\`\`jsx
const element = <h1>Hello, world!</h1>;
\`\`\`

## Props

Props are how components receive data:

\`\`\`jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
    </div>
  );
}
\`\`\`

## Exercise

Create a \`UserCard\` component that displays:
- User's name
- User's email
- User's profile picture

Try implementing this component and see how props work in practice!`,
            resources: [
              {
                id: '5',
                title: 'Component Examples',
                type: 'pdf',
                url: '/component-examples.pdf',
                size: '3.1 MB',
              },
            ],
            completed: false,
          },
        ],
      },
      {
        id: '2',
        title: 'State Management',
        description:
          'Learn how to manage component state and handle user interactions',
        order: 2,
        completed: false,
        totalDuration: 150,
        lessons: [
          {
            id: '1',
            title: 'Understanding State',
            description: 'What is state and why do we need it?',
            duration: 30,
            order: 1,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Understanding State in React

State is one of the most important concepts in React. It allows components to create and manage their own data that can change over time.

## What is State?

State is a JavaScript object that stores component data that may change during the component's lifecycle. When state changes, React re-renders the component.

## useState Hook

The \`useState\` hook is the most common way to add state to functional components:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## State Rules

1. **Never mutate state directly** - Always use the setter function
2. **State updates are asynchronous** - React batches updates for performance
3. **State is local** - Each component instance has its own state

## Common Patterns

### Toggle State
\`\`\`jsx
const [isVisible, setIsVisible] = useState(false);
const toggle = () => setIsVisible(!isVisible);
\`\`\`

### Form Input State
\`\`\`jsx
const [inputValue, setInputValue] = useState('');
const handleChange = (e) => setInputValue(e.target.value);
\`\`\`

Understanding state is crucial for building interactive React applications!`,
            resources: [
              {
                id: '6',
                title: 'State Management Patterns',
                type: 'pdf',
                url: '/state-patterns.pdf',
                size: '2.8 MB',
              },
            ],
            completed: false,
          },
          {
            id: '2',
            title: 'Event Handling',
            description: 'Handle user interactions and events in React',
            duration: 25,
            order: 2,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Event Handling in React

React provides a powerful event system that allows you to handle user interactions like clicks, form submissions, and keyboard input.

## SyntheticEvents

React wraps native events in SyntheticEvent objects, providing consistent behavior across browsers.

## Common Event Handlers

### Click Events
\`\`\`jsx
function Button() {
  const handleClick = (e) => {
    e.preventDefault();
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}
\`\`\`

### Form Events
\`\`\`jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
\`\`\`

### Keyboard Events
\`\`\`jsx
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    // Handle enter key
  }
};
\`\`\`

## Best Practices

1. Use arrow functions or bind methods properly
2. Prevent default behavior when needed
3. Don't call event handlers directly in JSX
4. Use event delegation for performance

Master event handling to create truly interactive applications!`,
            resources: [
              {
                id: '7',
                title: 'Event Handling Guide',
                type: 'doc',
                url: '/event-handling.docx',
                size: '1.9 MB',
              },
            ],
            completed: false,
          },
        ],
      },
      {
        id: '3',
        title: 'Advanced Concepts',
        description:
          'Explore advanced React patterns and optimization techniques',
        order: 3,
        completed: false,
        totalDuration: 210,
        lessons: [
          {
            id: '1',
            title: 'React Hooks Deep Dive',
            description: 'Master useEffect, useContext, and custom hooks',
            duration: 45,
            order: 1,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# React Hooks Deep Dive

Hooks are functions that let you "hook into" React features from functional components. Let's explore the most important hooks.

## useEffect Hook

The \`useEffect\` hook lets you perform side effects in functional components:

\`\`\`jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data
    fetchUser(userId).then(setUser);
  }, [userId]); // Dependency array

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## useContext Hook

Share data between components without prop drilling:

\`\`\`jsx
const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Header />
    </ThemeContext.Provider>
  );
}

function Header() {
  const theme = useContext(ThemeContext);
  return <header className={theme}>Header</header>;
}
\`\`\`

## Custom Hooks

Create reusable stateful logic:

\`\`\`jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
\`\`\`

## Hook Rules

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use ESLint plugin for hooks

Hooks make functional components as powerful as class components!`,
            resources: [
              {
                id: '8',
                title: 'Hooks Reference',
                type: 'pdf',
                url: '/hooks-reference.pdf',
                size: '4.2 MB',
              },
            ],
            completed: false,
          },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Advanced JavaScript Mastery',
    description:
      'Deep dive into advanced JavaScript concepts and modern ES6+ features',
    instructor: 'Mike Chen',
    rating: 4.9,
    totalStudents: 890,
    progress: 0,
    totalDuration: 360,
    modules: [
      {
        id: '1',
        title: 'Modern JavaScript Features',
        description: 'ES6+ features that every developer should know',
        order: 1,
        completed: false,
        totalDuration: 180,
        lessons: [
          {
            id: '1',
            title: 'Arrow Functions and Template Literals',
            description: 'Modern syntax for cleaner code',
            duration: 30,
            order: 1,
            videoUrl: '/placeholder.svg?height=400&width=600',
            content: `# Arrow Functions and Template Literals

Modern JavaScript provides cleaner syntax for common patterns. Let's explore arrow functions and template literals.

## Arrow Functions

Arrow functions provide a shorter syntax for writing functions:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With single parameter
const square = x => x * x;

// With no parameters
const greet = () => 'Hello!';
\`\`\`

## Template Literals

Template literals allow embedded expressions and multi-line strings:

\`\`\`javascript
const name = 'John';
const age = 30;

// Template literal
const message = \`Hello, my name is \${name} and I'm \${age} years old.\`;

// Multi-line strings
const html = \`
  <div>
    <h1>\${title}</h1>
    <p>\${content}</p>
  </div>
\`;
\`\`\`

## Practical Examples

\`\`\`javascript
// API URL building
const buildApiUrl = (endpoint, params) => 
  \`/api/\${endpoint}?\${new URLSearchParams(params)}\`;

// Conditional rendering in templates
const renderUser = user => \`
  <div class="user">
    <h2>\${user.name}</h2>
    \${user.email ? \`<p>\${user.email}</p>\` : ''}
  </div>
\`;
\`\`\`

These features make JavaScript code more readable and maintainable!`,
            resources: [
              {
                id: '9',
                title: 'ES6+ Features Cheatsheet',
                type: 'pdf',
                url: '/es6-cheatsheet.pdf',
                size: '2.1 MB',
              },
            ],
            completed: false,
          },
        ],
      },
    ],
  },
}

export default function LessonViewer({
  courseId,
  moduleId,
  lessonId,
}: LessonViewerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Video player state
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Video player functions
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = clickX / width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
    }
  }

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = Number.parseFloat(e.target.value)
    setPlaybackSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
      const activeElement = document.activeElement?.tagName
      if (
        e.key === ' ' &&
        activeElement !== 'INPUT' &&
        activeElement !== 'TEXTAREA'
      ) {
        e.preventDefault()
        togglePlayPause()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isFullscreen, isPlaying])

  // Fetch course data and navigate to appropriate lesson
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const courseData = mockCourses[courseId]
        if (!courseData) {
          throw new Error(`Course with ID "${courseId}" not found`)
        }

        setCourse(courseData)

        // If no module/lesson specified, redirect to first lesson
        if (!moduleId || !lessonId) {
          const firstModule = courseData.modules[0]
          const firstLesson = firstModule?.lessons[0]

          if (firstModule && firstLesson) {
            router.replace(
              `/learn/${courseId}?module=${firstModule.id}&lesson=${firstLesson.id}`
            )
            return
          }
        }

        // Find current module and lesson
        const module = courseData.modules.find(m => m.id === moduleId)
        if (!module) {
          throw new Error(
            `Module with ID "${moduleId}" not found in course "${courseData.title}"`
          )
        }

        const lesson = module.lessons.find(l => l.id === lessonId)
        if (!lesson) {
          throw new Error(
            `Lesson with ID "${lessonId}" not found in module "${module.title}"`
          )
        }

        setCurrentModule(module)
        setCurrentLesson(lesson)
        setExpandedModules(new Set([moduleId]))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load course content'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, moduleId, lessonId, router])

  const handleLessonComplete = () => {
    if (!currentLesson || !course) return

    const updatedCourse = { ...course }
    const moduleIndex = updatedCourse.modules.findIndex(
      m => m.id === currentModule?.id
    )
    const lessonIndex = updatedCourse.modules[moduleIndex].lessons.findIndex(
      l => l.id === currentLesson.id
    )

    updatedCourse.modules[moduleIndex].lessons[lessonIndex].completed = true

    // Update module completion
    const moduleCompleted = updatedCourse.modules[moduleIndex].lessons.every(
      l => l.completed
    )
    updatedCourse.modules[moduleIndex].completed = moduleCompleted

    // Update course progress
    const totalLessons = updatedCourse.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    )
    const completedLessons = updatedCourse.modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.completed).length,
      0
    )
    updatedCourse.progress = (completedLessons / totalLessons) * 100

    setCourse(updatedCourse)
    setCurrentLesson({ ...currentLesson, completed: true })

    toast({
      title: 'Lesson Completed!',
      description: `You've completed "${currentLesson.title}"`,
    })
  }

  const navigateToLesson = (targetModuleId: string, targetLessonId: string) => {
    router.push(
      `/learn/${courseId}?module=${targetModuleId}&lesson=${targetLessonId}`
    )
  }

  const getNextLesson = () => {
    if (!course || !currentModule || !currentLesson) return null

    const currentModuleIndex = course.modules.findIndex(
      m => m.id === currentModule.id
    )
    const currentLessonIndex = currentModule.lessons.findIndex(
      l => l.id === currentLesson.id
    )

    // Next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        module: currentModule,
        lesson: currentModule.lessons[currentLessonIndex + 1],
      }
    }

    // First lesson of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1]
      return {
        module: nextModule,
        lesson: nextModule.lessons[0],
      }
    }

    return null
  }

  const getPreviousLesson = () => {
    if (!course || !currentModule || !currentLesson) return null

    const currentModuleIndex = course.modules.findIndex(
      m => m.id === currentModule.id
    )
    const currentLessonIndex = currentModule.lessons.findIndex(
      l => l.id === currentLesson.id
    )

    // Previous lesson in current module
    if (currentLessonIndex > 0) {
      return {
        module: currentModule,
        lesson: currentModule.lessons[currentLessonIndex - 1],
      }
    }

    // Last lesson of previous module
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1]
      return {
        module: prevModule,
        lesson: prevModule.lessons[prevModule.lessons.length - 1],
      }
    }

    return null
  }

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <div className='space-y-2'>
            <p className='text-lg font-medium'>Loading course content...</p>
            <p className='text-sm text-muted-foreground'>
              Please wait while we fetch your lesson
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto'>
        <Alert className='border-destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-destructive'>
                  Error Loading Content
                </h3>
                <p className='mt-1'>{error}</p>
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={() => window.location.reload()}
                  size='sm'
                  variant='outline'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/courses')}
                  size='sm'
                  variant='outline'
                >
                  <Home className='h-4 w-4 mr-2' />
                  Back to Courses
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!course || !currentModule || !currentLesson) {
    return (
      <Alert className='max-w-2xl mx-auto'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-3'>
            <div>
              <h3 className='font-semibold'>Content Not Available</h3>
              <p>The requested lesson content could not be found.</p>
            </div>
            <Button onClick={() => router.push('/courses')} size='sm'>
              <Home className='h-4 w-4 mr-2' />
              Back to Courses
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const nextLesson = getNextLesson()
  const previousLesson = getPreviousLesson()

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='/courses'>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/courses/${course.id}`}>
              {course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentModule.title}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentLesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl'>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
              <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                <span className='flex items-center'>
                  <Users className='h-4 w-4 mr-1' />
                  {course.totalStudents.toLocaleString()} students
                </span>
                <span className='flex items-center'>
                  <Star className='h-4 w-4 mr-1 fill-yellow-400 text-yellow-400' />
                  {course.rating}
                </span>
                <span>Instructor: {course.instructor}</span>
                <span className='flex items-center'>
                  <Clock className='h-4 w-4 mr-1' />
                  {Math.floor(course.totalDuration / 60)}h{' '}
                  {course.totalDuration % 60}m
                </span>
              </div>
            </div>
            <Badge variant='secondary'>
              {Math.round(course.progress)}% Complete
            </Badge>
          </div>
          <Progress value={course.progress} className='w-full' />
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-3 space-y-6'>
          {/* Current Module Info */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>
                    Module {currentModule.order}: {currentModule.title}
                  </CardTitle>
                  <CardDescription>{currentModule.description}</CardDescription>
                </div>
                <Badge
                  variant={currentModule.completed ? 'default' : 'secondary'}
                >
                  {currentModule.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Enhanced Video Player */}
          <Card>
            <CardContent className='p-0'>
              <div
                className={`relative bg-black transition-all duration-300 ${
                  isFullscreen ? 'fixed inset-0 z-50' : 'rounded-t-lg'
                }`}
                ref={videoContainerRef}
              >
                <video
                  ref={videoRef}
                  className={`w-full object-contain ${
                    isFullscreen
                      ? 'h-screen'
                      : videoSize === 'small'
                        ? 'h-48 md:h-64'
                        : videoSize === 'medium'
                          ? 'h-64 md:h-80 lg:h-96'
                          : 'h-80 md:h-96 lg:h-[32rem]'
                  }`}
                  poster={
                    currentLesson.videoUrl ||
                    '/placeholder.svg?height=400&width=600'
                  }
                  controls={false}
                  onClick={togglePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={currentLesson.videoUrl} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>

                {/* Video Overlay Controls */}
                <div
                  className={`absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 ${isPlaying ? '' : 'opacity-100'}`}
                >
                  {/* Center Play/Pause Button */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Button
                      size='lg'
                      variant='secondary'
                      className='rounded-full h-16 w-16 bg-black/50 hover:bg-black/70 backdrop-blur-sm'
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className='h-8 w-8' />
                      ) : (
                        <Play className='h-8 w-8 ml-1' />
                      )}
                    </Button>
                  </div>

                  {/* Top Controls */}
                  <div className='absolute top-4 right-4 flex items-center space-x-2'>
                    {/* Video Size Controls */}
                    <div className='flex items-center space-x-1 bg-black/50 rounded-lg p-1 backdrop-blur-sm'>
                      <Button
                        size='sm'
                        variant={videoSize === 'small' ? 'secondary' : 'ghost'}
                        className='h-8 w-8 p-0 text-white hover:text-black'
                        onClick={() => setVideoSize('small')}
                        title='Small video'
                      >
                        <Monitor className='h-3 w-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant={videoSize === 'medium' ? 'secondary' : 'ghost'}
                        className='h-8 w-8 p-0 text-white hover:text-black'
                        onClick={() => setVideoSize('medium')}
                        title='Medium video'
                      >
                        <Monitor className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant={videoSize === 'large' ? 'secondary' : 'ghost'}
                        className='h-8 w-8 p-0 text-white hover:text-black'
                        onClick={() => setVideoSize('large')}
                        title='Large video'
                      >
                        <Monitor className='h-5 w-5' />
                      </Button>
                    </div>

                    {/* Fullscreen Toggle */}
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black bg-black/50 hover:bg-white/90 backdrop-blur-sm'
                      onClick={toggleFullscreen}
                      title={
                        isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                      }
                    >
                      {isFullscreen ? (
                        <Minimize2 className='h-4 w-4' />
                      ) : (
                        <Maximize2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                    {/* Progress Bar */}
                    <div className='mb-3'>
                      <div
                        className='w-full h-1 bg-white/30 rounded-full cursor-pointer'
                        onClick={handleProgressClick}
                        ref={progressBarRef}
                      >
                        <div
                          className='h-full bg-primary rounded-full transition-all duration-150'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                          onClick={() =>
                            previousLesson &&
                            navigateToLesson(
                              previousLesson.module.id,
                              previousLesson.lesson.id
                            )
                          }
                          disabled={!previousLesson}
                          title='Previous lesson'
                        >
                          <SkipBack className='h-4 w-4' />
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                          onClick={() => seekVideo(-10)}
                          title='Rewind 10 seconds'
                        >
                          <RotateCcw className='h-4 w-4' />
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                          onClick={togglePlayPause}
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <Pause className='h-4 w-4' />
                          ) : (
                            <Play className='h-4 w-4' />
                          )}
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                          onClick={() => seekVideo(10)}
                          title='Forward 10 seconds'
                        >
                          <RotateCw className='h-4 w-4' />
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                          onClick={() =>
                            nextLesson &&
                            navigateToLesson(
                              nextLesson.module.id,
                              nextLesson.lesson.id
                            )
                          }
                          disabled={!nextLesson}
                          title='Next lesson'
                        >
                          <SkipForward className='h-4 w-4' />
                        </Button>

                        {/* Volume Control */}
                        <div className='flex items-center space-x-2'>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                            onClick={toggleMute}
                            title={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className='h-4 w-4' />
                            ) : (
                              <Volume2 className='h-4 w-4' />
                            )}
                          </Button>
                          <input
                            type='range'
                            min='0'
                            max='1'
                            step='0.1'
                            value={volume}
                            onChange={handleVolumeChange}
                            className='w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider'
                            title='Volume'
                          />
                        </div>
                      </div>

                      <div className='flex items-center space-x-4 text-white text-sm'>
                        {/* Time Display */}
                        <span className='font-mono'>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Playback Speed */}
                        <select
                          value={playbackSpeed}
                          onChange={handleSpeedChange}
                          className='bg-black/50 text-white text-xs rounded px-2 py-1 border-none outline-none cursor-pointer'
                          title='Playback speed'
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fullscreen Exit Hint */}
                {isFullscreen && (
                  <div className='absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm'>
                    Press ESC to exit fullscreen
                  </div>
                )}
              </div>

              {/* Video Info Bar (only visible when not fullscreen) */}
              {!isFullscreen && (
                <div className='p-4 border-t bg-muted/30'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>{currentLesson.duration} min</span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                        <Monitor className='h-4 w-4' />
                        <span className='capitalize'>{videoSize} player</span>
                      </div>
                      {currentLesson.completed && (
                        <Badge variant='secondary' className='text-xs'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center space-x-2'>
                      {!currentLesson.completed && (
                        <Button size='sm' onClick={handleLessonComplete}>
                          <CheckCircle className='h-4 w-4 mr-2' />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={toggleFullscreen}
                      >
                        <Maximize2 className='h-4 w-4 mr-2' />
                        Fullscreen
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <BookOpen className='h-5 w-5 mr-2' />
                Lesson {currentLesson.order}: {currentLesson.title}
                {currentLesson.completed && (
                  <CheckCircle className='h-5 w-5 ml-2 text-green-500' />
                )}
              </CardTitle>
              <CardDescription>{currentLesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='content' className='w-full'>
                <TabsList>
                  <TabsTrigger value='content'>Lesson Content</TabsTrigger>
                  <TabsTrigger value='resources'>
                    Resources ({currentLesson.resources.length})
                  </TabsTrigger>
                  <TabsTrigger value='discussion'>Discussion</TabsTrigger>
                </TabsList>

                <TabsContent value='content' className='mt-4'>
                  <div className='prose prose-sm max-w-none dark:prose-invert'>
                    <div className='whitespace-pre-wrap'>
                      {currentLesson.content}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='resources' className='mt-4'>
                  <div className='space-y-3'>
                    {currentLesson.resources.length === 0 ? (
                      <p className='text-muted-foreground text-center py-8'>
                        No resources available for this lesson.
                      </p>
                    ) : (
                      currentLesson.resources.map(resource => (
                        <div
                          key={resource.id}
                          className='flex items-center justify-between p-3 border rounded-lg'
                        >
                          <div className='flex items-center space-x-3'>
                            <FileText className='h-5 w-5 text-muted-foreground' />
                            <div>
                              <p className='font-medium'>{resource.title}</p>
                              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                                <span className='capitalize'>
                                  {resource.type}
                                </span>
                                {resource.size && (
                                  <>
                                    <span>•</span>
                                    <span>{resource.size}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant='outline' size='sm'>
                            <Download className='h-4 w-4 mr-2' />
                            Download
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='discussion' className='mt-4'>
                  <DiscussionSection
                    courseId={courseId}
                    lessonId={currentLesson.id}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className='flex justify-between'>
            <Button
              variant='outline'
              onClick={() =>
                previousLesson &&
                navigateToLesson(
                  previousLesson.module.id,
                  previousLesson.lesson.id
                )
              }
              disabled={!previousLesson}
            >
              <SkipBack className='h-4 w-4 mr-2' />
              Previous Lesson
            </Button>
            <Button
              onClick={() =>
                nextLesson &&
                navigateToLesson(nextLesson.module.id, nextLesson.lesson.id)
              }
              disabled={!nextLesson}
            >
              Next Lesson
              <SkipForward className='h-4 w-4 ml-2' />
            </Button>
          </div>
        </div>

        {/* Sidebar - Course Structure */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Course Content</CardTitle>
              <CardDescription>
                {course.modules.length} modules •{' '}
                {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}{' '}
                lessons
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {course.modules.map(module => (
                <Collapsible
                  key={module.id}
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModuleExpansion(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className='flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted'>
                      <div className='flex items-center space-x-2'>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                        <div className='text-left'>
                          <p className='font-medium text-sm'>
                            Module {module.order}: {module.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {module.lessons.length} lessons •{' '}
                            {Math.floor(module.totalDuration / 60)}h{' '}
                            {module.totalDuration % 60}m
                          </p>
                        </div>
                      </div>
                      {module.completed && (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='space-y-1 ml-6 mt-2'>
                    {module.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                          currentLesson?.id === lesson.id
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => navigateToLesson(module.id, lesson.id)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <p className='font-medium'>
                              {lesson.order}. {lesson.title}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {lesson.duration} minutes
                            </p>
                          </div>
                          {lesson.completed && (
                            <CheckCircle className='h-3 w-3 text-green-500' />
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

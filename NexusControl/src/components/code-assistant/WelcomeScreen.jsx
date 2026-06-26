import React from 'react';
import TemplateCard from './TemplateCard';
import { Sparkles, Code2, Zap, BookOpen } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'react-dashboard',
    title: 'React Dashboard',
    description: 'Build a modern admin dashboard with charts, tables, and auth',
    category: 'web',
    tags: ['React', 'Tailwind', 'Charts'],
    prompt: 'Help me build a modern React admin dashboard with a sidebar navigation, a stats overview with charts, a data table with sorting and filtering, and a clean dark theme. Use Tailwind CSS for styling. Start with the project structure and main layout.',
  },
  {
    id: 'python-api',
    title: 'REST API with FastAPI',
    description: 'Create a production-ready API with authentication and database',
    category: 'web',
    tags: ['Python', 'FastAPI', 'PostgreSQL'],
    prompt: 'Guide me through building a production-ready REST API using Python FastAPI. Include user authentication with JWT tokens, PostgreSQL database integration with SQLAlchemy, CRUD endpoints, input validation, and error handling. Start with the project setup.',
  },
  {
    id: 'unity-platformer',
    title: '2D Platformer Game',
    description: 'Create a classic side-scrolling platformer with Unity and C#',
    category: 'game',
    tags: ['Unity', 'C#', '2D'],
    prompt: 'Help me create a 2D side-scrolling platformer game in Unity with C#. I need a player controller with running, jumping, and wall-jumping mechanics, a simple level design system with tilemap, collectible items, enemies with basic AI, and a score system. Start with the project setup and player controller.',
  },
  {
    id: 'ml-pipeline',
    title: 'ML Data Pipeline',
    description: 'Build a machine learning pipeline for data processing and model training',
    category: 'data',
    tags: ['Python', 'scikit-learn', 'Pandas'],
    prompt: 'Walk me through building a complete machine learning pipeline in Python. Include data loading and cleaning with Pandas, feature engineering, model training with scikit-learn, cross-validation, hyperparameter tuning, and model evaluation with visualization. Use a practical dataset example.',
  },
  {
    id: 'flutter-app',
    title: 'Flutter Mobile App',
    description: 'Build a cross-platform mobile app with Flutter and Dart',
    category: 'mobile',
    tags: ['Flutter', 'Dart', 'Mobile'],
    prompt: 'Help me build a Flutter mobile app with a bottom navigation bar, a home screen with cards, a detail screen with animations, state management using Provider, and a clean Material Design 3 theme. Start with the project structure.',
  },
  {
    id: 'docker-deploy',
    title: 'Docker + CI/CD Setup',
    description: 'Containerize an app and set up automated deployment',
    category: 'devops',
    tags: ['Docker', 'GitHub Actions', 'CI/CD'],
    prompt: 'Guide me through containerizing a web application with Docker, creating a multi-stage Dockerfile, setting up docker-compose for local development, and configuring a CI/CD pipeline with GitHub Actions for automated testing and deployment. Include best practices for security and optimization.',
  },
];

const SUGGESTIONS = [
  { icon: Code2, text: "Generate a Node.js Express server with TypeScript" },
  { icon: Zap, text: "Build a real-time chat app with WebSockets" },
  { icon: BookOpen, text: "Explain async/await patterns in JavaScript" },
  { icon: Sparkles, text: "Create a responsive landing page with animations" },
];

export default function WelcomeScreen({ onSelectTemplate, onSendMessage }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          What shall we build?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          I can generate code in any language, guide you through full projects, and help you solve complex problems.
        </p>
      </div>

      {/* Quick Suggestions */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(s.text)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
            >
              <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="w-full">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Project Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map(template => (
            <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
          ))}
        </div>
      </div>
    </div>
  );
}
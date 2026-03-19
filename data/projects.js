export const projects = [
  {
    title: "POA Management System",
    description: "Comprehensive platform for planning and budget management with RBAC model",
    longDescription: "A full-stack enterprise application designed for institutional planning and budget management. The system implements a robust Role-Based Access Control (RBAC) model with multiple user hierarchies. Built with modern security practices including JWT authentication, password hashing with bcrypt, and SQL injection prevention. Features include real-time budget tracking, collaborative planning tools, comprehensive reporting dashboards, and audit logging for compliance. The frontend uses React with TypeScript for type safety, while the backend leverages FastAPI's async capabilities for optimal performance. PostgreSQL handles complex relational data, and Docker ensures consistent deployment across environments.",
    tech: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    video: "/videos/poa-management.mp4",
    links: {
      frontend: "https://github.com/majoduan/Software_Seguro_Grupo_4_Front.git",
      backend: "https://github.com/majoduan/Software_Seguro_Grupo_4_Back.git",
      demo: "https://software-seguro-grupo-4-front.vercel.app/login"
    }
  },
  {
    title: "EPN Certificates Automation",
    description: "Python tool for automated certificate generation with web scraping and data processing",
    longDescription: "An intelligent automation tool developed to streamline the certificate generation process for educational institutions. The system uses Selenium for web scraping to extract student data, Pandas for efficient data processing and validation, and automated template filling for certificate generation. Features include batch processing of hundreds of certificates, data validation and error handling, duplicate detection, and export to multiple formats (PDF, Excel). The Jupyter notebook environment provides an interactive interface for monitoring the process and debugging. This tool reduced certificate generation time from 3 hours to 15 minutes, significantly improving administrative efficiency.",
    tech: ["Python", "Pandas", "Selenium", "Jupyter"],
    video: "/videos/epn-certificates.mp4",
    links: {
      github: "https://github.com/majoduan/epn-certificates-automation.git"
    }
  },
  {
    title: "Travel Allowance Calculator",
    description: "Budget estimation system with intelligent suggestions and export capabilities",
    longDescription: "A sophisticated budget planning application for business travel and institutional expenses. The system provides intelligent cost estimation based on destination, duration, and travel category, with real-time calculations and dynamic form validation. Features include multi-currency support, historical data tracking for better estimates, PDF export with detailed breakdown, and integration with institutional budget systems. The interface is designed for ease of use with step-by-step wizards, auto-save functionality, and responsive design for mobile approval workflows. Built with modern React practices including hooks and context API for state management.",
    tech: ["React", "JavaScript"],
    video: "/videos/travel-allowance.mp4",
    links: {
      demo: "https://main.d2sfix2konl7t2.amplifyapp.com/Travel",
      github: "https://github.com/FormsDi/FormsDi"
    }
  },
  {
    title: "StoryCraft Platform",
    description: "Collaborative storytelling with monolithic and microservices architectures",
    longDescription: "An innovative platform for collaborative creative writing that demonstrates both monolithic and microservices architectural patterns. Users can create, share, and co-author stories in real-time with version control and branching narratives. The platform implements WebSocket for real-time collaboration, NestJS microservices for scalability (auth service, story service, notification service), React with Redux for complex state management, and SQL Server for transactional data integrity. Features include character and plot management tools, AI-powered writing suggestions, publishing workflows, and community features like comments and ratings. The project showcases modern software architecture principles including API Gateway pattern, event-driven communication, and containerization with Docker Compose.",
    tech: ["Node.js", "NestJS", "React", "SQL Server", "Docker"],
    video: "/videos/storycraft.mp4",
    links: {
      github: "https://github.com/majoduan/StoryCraft-Project-.git"
    }
  },
  {
    title: "Fitness Tracker",
    description: "A web application built for managing workout routines and tracking fitness progress.",
    longDescription: "A comprehensive fitness management application built with ASP.NET Web Forms demonstrating enterprise-level architecture patterns. The application uses a strict N-Layer architecture separating Presentation, Business Logic, and Data Access layers for maintainability and testability. Features include personalized workout routine creation with exercise libraries, progress tracking with charts and statistics, calorie and nutrition logging, goal setting and achievement tracking, and social features for sharing progress. The backend implements stored procedures for data operations, Entity Framework for ORM, and includes proper exception handling and logging. Security features include input validation, SQL injection prevention, and session management.",
    tech: ["ASP.NET", "N-Layer architecture", "SQL Server"],
    video: "/videos/fitness-tracker.mp4",
    links: {
      github: "https://github.com/majoduan/Fitness-Tracker---ASP.NET-Web-Forms-Application.git"
    }
  },
  {
    title: "Space Invaders",
    description: "Classic Space Invaders game.",
    longDescription: "A faithful recreation of the iconic Space Invaders arcade game using Python and Pygame, demonstrating game development fundamentals and object-oriented programming. The game features smooth 60 FPS gameplay, sprite-based graphics with custom assets, collision detection systems, progressive difficulty with increasing alien speed, power-up mechanics, high score persistence, and sound effects. Technical highlights include game state management, entity component system for game objects, optimized rendering with sprite groups, and input handling with configurable controls. The project showcases understanding of game loops, frame-independent movement, and classic arcade game design patterns.",
    tech: ["Python", "Pygame"],
    video: "/videos/space-invaders.mp4",
    links: {
      github: "https://github.com/majoduan/Space-Invaders---Python.git"
    }
  },
  {
    title: "Godot Game 2D",
    description: "Game with traps, fruits that give points and a final trophy that congratulates the player.",
    longDescription: "A 2D platformer game developed in Godot Engine showcasing fundamental game mechanics and level design principles. The game features physics-based character movement with jump mechanics, collectible system with scoring, hazard and trap mechanics requiring timing and skill, checkpoint system for player progression, and particle effects for visual feedback. Built using Godot's node-based scene system, GDScript for game logic, tilemap system for level design, and animation state machines for character states. The project demonstrates understanding of 2D game physics, collision layers, signal system for event handling, and game feel through careful tuning of movement parameters.",
    tech: ["Godot"],
    video: "/videos/godot-game-2d.mp4",
    links: {
      github: "https://github.com/majoduan/Godot-Game-2D.git"
    }
  },
  {
    title: "Godot Game 3D",
    description: "Game where you control a cube, climb a mountain and collect coins at the top.",
    longDescription: "An exploration of 3D game development using Godot Engine, featuring a challenging mountain climbing experience with physics-based movement. The game implements 3D character controller with camera follow system, terrain generation and environmental design, collectible system with 3D spatial awareness, lighting and shadow effects for atmosphere, and victory condition with reward feedback. Technical aspects include Godot's 3D physics engine, spatial nodes and transforms, camera positioning algorithms, mesh and material systems, and 3D collision detection. The project explores fundamental concepts of 3D game development including vector mathematics, quaternion rotations, and level design in three dimensions.",
    tech: ["Godot"],
    video: "/videos/godot-game-3d.mp4",
    links: {
      github: "https://github.com/majoduan/Godot-Game-3D.git"
    }
  }
];

export const certificates = [
  { title: "EPN Academic Excellence Award", org: "Escuela Politécnica Nacional", icon: "🏆", image: "/images/certificates/epn-award.webp" },
  { title: "Networking Basics", org: "Cisco Networking Academy", icon: "🌐", image: "/images/certificates/cisco-networking.webp" },
  { title: "Digital Transformation", org: "Instituto Europeo de Posgrado", icon: "🚀", image: "/images/certificates/digital-transformation.webp" },
  { title: "SCRUM Foundation", org: "Certiprof - SFPC™", icon: "⚡", image: "/images/certificates/scrum-foundation.webp" }
];

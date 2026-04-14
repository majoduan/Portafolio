// Helper function to get translated project data
export const getProjectsData = (t) => [
  {
    slug: 'poa',
    title: t('projects.items.poa.title'),
    description: t('projects.items.poa.description'),
    summary: t('projects.items.poa.summary'),
    longDescription: t('projects.items.poa.longDescription'),
    keyFeatures: {
      RBAC: t('projects.items.poa.keyFeatures.RBAC'),
      'Budget Tracking': t('projects.items.poa.keyFeatures.Budget Tracking'),
      Reporting: t('projects.items.poa.keyFeatures.Reporting'),
      'Audit Logging': t('projects.items.poa.keyFeatures.Audit Logging'),
      'JWT Auth': t('projects.items.poa.keyFeatures.JWT Auth'),
    },
    techDescriptions: {
      React: t('projects.items.poa.techDescriptions.React'),
      TypeScript: t('projects.items.poa.techDescriptions.TypeScript'),
      FastAPI: t('projects.items.poa.techDescriptions.FastAPI'),
      PostgreSQL: t('projects.items.poa.techDescriptions.PostgreSQL'),
      Docker: t('projects.items.poa.techDescriptions.Docker'),
    },
    techImpl: t('projects.items.poa.techImpl'),
    tech: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    video: "/media/projects/videos/poa-management.mp4",
    links: {
      github: [
        "https://github.com/majoduan/Software_Seguro_Grupo_4_Front.git",
        "https://github.com/majoduan/Software_Seguro_Grupo_4_Back.git"
      ],
      demo: "https://software-seguro-grupo-4-front.vercel.app/login"
    }
  },
  {
    slug: 'certificates',
    title: t('projects.items.certificates.title'),
    description: t('projects.items.certificates.description'),
    summary: t('projects.items.certificates.summary'),
    longDescription: t('projects.items.certificates.longDescription'),
    keyFeatures: {
      'Batch Processing': t('projects.items.certificates.keyFeatures.Batch Processing'),
      'Web Scraping': t('projects.items.certificates.keyFeatures.Web Scraping'),
      'Data Validation': t('projects.items.certificates.keyFeatures.Data Validation'),
      'Multi-format Export': t('projects.items.certificates.keyFeatures.Multi-format Export'),
      'Jupyter Interface': t('projects.items.certificates.keyFeatures.Jupyter Interface'),
    },
    techDescriptions: {
      Python: t('projects.items.certificates.techDescriptions.Python'),
      Pandas: t('projects.items.certificates.techDescriptions.Pandas'),
      Selenium: t('projects.items.certificates.techDescriptions.Selenium'),
      Jupyter: t('projects.items.certificates.techDescriptions.Jupyter'),
    },
    techImpl: t('projects.items.certificates.techImpl'),
    tech: ["Python", "Pandas", "Selenium", "Jupyter"],
    video: "/media/projects/videos/epn-certificates.mp4",
    links: {
      github: "https://github.com/majoduan/epn-certificates-automation.git"
    }
  },
  {
    slug: 'travel',
    title: t('projects.items.travel.title'),
    description: t('projects.items.travel.description'),
    summary: t('projects.items.travel.summary'),
    longDescription: t('projects.items.travel.longDescription'),
    keyFeatures: {
      'Cost Estimation': t('projects.items.travel.keyFeatures.Cost Estimation'),
      'Multi-currency': t('projects.items.travel.keyFeatures.Multi-currency'),
      'Historical Data': t('projects.items.travel.keyFeatures.Historical Data'),
      'PDF Export': t('projects.items.travel.keyFeatures.PDF Export'),
      'Step-by-step Wizard': t('projects.items.travel.keyFeatures.Step-by-step Wizard'),
    },
    techDescriptions: {
      React: t('projects.items.travel.techDescriptions.React'),
      JavaScript: t('projects.items.travel.techDescriptions.JavaScript'),
    },
    techImpl: t('projects.items.travel.techImpl'),
    tech: ["React", "JavaScript"],
    video: "/media/projects/videos/travel-allowance.mp4",
    links: {
      demo: "https://main.d2sfix2konl7t2.amplifyapp.com/Travel",
      github: "https://github.com/FormsDi/FormsDi"
    }
  },
  {
    slug: 'storycraft',
    title: t('projects.items.storycraft.title'),
    description: t('projects.items.storycraft.description'),
    summary: t('projects.items.storycraft.summary'),
    longDescription: t('projects.items.storycraft.longDescription'),
    keyFeatures: {
      'Real-time Co-authoring': t('projects.items.storycraft.keyFeatures.Real-time Co-authoring'),
      'Version Control': t('projects.items.storycraft.keyFeatures.Version Control'),
      Microservices: t('projects.items.storycraft.keyFeatures.Microservices'),
      'Story Management': t('projects.items.storycraft.keyFeatures.Story Management'),
      Community: t('projects.items.storycraft.keyFeatures.Community'),
    },
    techDescriptions: {
      'Node.js': t('projects.items.storycraft.techDescriptions.Node.js'),
      NestJS: t('projects.items.storycraft.techDescriptions.NestJS'),
      React: t('projects.items.storycraft.techDescriptions.React'),
      'SQL Server': t('projects.items.storycraft.techDescriptions.SQL Server'),
      Docker: t('projects.items.storycraft.techDescriptions.Docker'),
    },
    techImpl: t('projects.items.storycraft.techImpl'),
    tech: ["Node.js", "NestJS", "React", "SQL Server", "Docker"],
    video: "/media/projects/videos/storycraft.mp4",
    links: {
      github: "https://github.com/majoduan/StoryCraft-Project-.git"
    }
  },
  {
    slug: 'fitness',
    title: t('projects.items.fitness.title'),
    description: t('projects.items.fitness.description'),
    summary: t('projects.items.fitness.summary'),
    longDescription: t('projects.items.fitness.longDescription'),
    keyFeatures: {
      'Workout Routines': t('projects.items.fitness.keyFeatures.Workout Routines'),
      'Progress Tracking': t('projects.items.fitness.keyFeatures.Progress Tracking'),
      'Nutrition Logging': t('projects.items.fitness.keyFeatures.Nutrition Logging'),
      'Social Sharing': t('projects.items.fitness.keyFeatures.Social Sharing'),
      'Stored Procedures': t('projects.items.fitness.keyFeatures.Stored Procedures'),
    },
    techDescriptions: {
      'ASP.NET': t('projects.items.fitness.techDescriptions.ASP.NET'),
      'N-Layer architecture': t('projects.items.fitness.techDescriptions.N-Layer architecture'),
      'SQL Server': t('projects.items.fitness.techDescriptions.SQL Server'),
    },
    techImpl: t('projects.items.fitness.techImpl'),
    tech: ["ASP.NET", "N-Layer architecture", "SQL Server"],
    video: "/media/projects/videos/fitness-tracker.mp4",
    links: {
      github: "https://github.com/majoduan/Fitness-Tracker---ASP.NET-Web-Forms-Application.git"
    }
  },
  {
    slug: 'space-invaders',
    title: t('projects.items.spaceInvaders.title'),
    description: t('projects.items.spaceInvaders.description'),
    summary: t('projects.items.spaceInvaders.summary'),
    longDescription: t('projects.items.spaceInvaders.longDescription'),
    keyFeatures: {
      '60 FPS Gameplay': t('projects.items.spaceInvaders.keyFeatures.60 FPS Gameplay'),
      'Progressive Difficulty': t('projects.items.spaceInvaders.keyFeatures.Progressive Difficulty'),
      'Power-ups': t('projects.items.spaceInvaders.keyFeatures.Power-ups'),
      'Sound & Collision': t('projects.items.spaceInvaders.keyFeatures.Sound & Collision'),
      'Entity Components': t('projects.items.spaceInvaders.keyFeatures.Entity Components'),
    },
    techDescriptions: {
      Python: t('projects.items.spaceInvaders.techDescriptions.Python'),
      Pygame: t('projects.items.spaceInvaders.techDescriptions.Pygame'),
    },
    techImpl: t('projects.items.spaceInvaders.techImpl'),
    tech: ["Python", "Pygame"],
    video: "/media/projects/videos/space-invaders.mp4",
    links: {
      github: "https://github.com/majoduan/Space-Invaders---Python.git"
    }
  },
  {
    slug: 'godot-2d',
    title: t('projects.items.godot2d.title'),
    description: t('projects.items.godot2d.description'),
    summary: t('projects.items.godot2d.summary'),
    longDescription: t('projects.items.godot2d.longDescription'),
    keyFeatures: {
      'Physics Movement': t('projects.items.godot2d.keyFeatures.Physics Movement'),
      Collectibles: t('projects.items.godot2d.keyFeatures.Collectibles'),
      'Hazards & Traps': t('projects.items.godot2d.keyFeatures.Hazards & Traps'),
      Checkpoints: t('projects.items.godot2d.keyFeatures.Checkpoints'),
      'Particle Effects': t('projects.items.godot2d.keyFeatures.Particle Effects'),
    },
    techDescriptions: {
      Godot: t('projects.items.godot2d.techDescriptions.Godot'),
    },
    techImpl: t('projects.items.godot2d.techImpl'),
    tech: ["Godot"],
    video: "/media/projects/videos/godot-game-2d.mp4",
    links: {
      github: "https://github.com/majoduan/Godot-Game-2D.git"
    }
  },
  {
    slug: 'godot-3d',
    title: t('projects.items.godot3d.title'),
    description: t('projects.items.godot3d.description'),
    summary: t('projects.items.godot3d.summary'),
    longDescription: t('projects.items.godot3d.longDescription'),
    keyFeatures: {
      '3D Controller': t('projects.items.godot3d.keyFeatures.3D Controller'),
      'Environment Design': t('projects.items.godot3d.keyFeatures.Environment Design'),
      '3D Collectibles': t('projects.items.godot3d.keyFeatures.3D Collectibles'),
      'Lighting & Shadows': t('projects.items.godot3d.keyFeatures.Lighting & Shadows'),
      'Victory System': t('projects.items.godot3d.keyFeatures.Victory System'),
    },
    techDescriptions: {
      Godot: t('projects.items.godot3d.techDescriptions.Godot'),
    },
    techImpl: t('projects.items.godot3d.techImpl'),
    tech: ["Godot"],
    video: "/media/projects/videos/godot-game-3d.mp4",
    links: {
      github: "https://github.com/majoduan/Godot-Game-3D.git"
    }
  }
];

// Helper function to get translated certificates data
export const getCertificatesData = (t) => [
  {
    title: t('certificates.items.epn.title'),
    org: t('certificates.items.epn.org'),
    icon: "🏆",
    slug: "epn-award"
  },
  {
    title: t('certificates.items.epnFinal.title'),
    org: t('certificates.items.epnFinal.org'),
    icon: "🎓",
    slug: "epn-final-award"
  },
  {
    title: t('certificates.items.cisco.title'),
    org: t('certificates.items.cisco.org'),
    icon: "🌐",
    slug: "cisco-networking"
  },
  {
    title: t('certificates.items.digital.title'),
    org: t('certificates.items.digital.org'),
    icon: "🚀",
    slug: "digital-transformation"
  },
  {
    title: t('certificates.items.scrum.title'),
    org: t('certificates.items.scrum.org'),
    icon: "⚡",
    slug: "scrum-foundation"
  },
  {
    title: t('certificates.items.ieeextreme.title'),
    org: t('certificates.items.ieeextreme.org'),
    icon: "💻",
    slug: "ieeextreme-certificate"
  }
];

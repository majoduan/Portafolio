// Helper function to get translated project data
export const getProjectsData = (t) => [
  {
    title: t('projects.items.poa.title'),
    description: t('projects.items.poa.description'),
    longDescription: t('projects.items.poa.longDescription'),
    tech: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    video: "/videos/poa-management.mp4",
    links: {
      [t('projects.items.poa.links.frontend')]: "https://github.com/majoduan/Software_Seguro_Grupo_4_Front.git",
      [t('projects.items.poa.links.backend')]: "https://github.com/majoduan/Software_Seguro_Grupo_4_Back.git",
      [t('projects.items.poa.links.demo')]: "https://software-seguro-grupo-4-front.vercel.app/login"
    }
  },
  {
    title: t('projects.items.certificates.title'),
    description: t('projects.items.certificates.description'),
    longDescription: t('projects.items.certificates.longDescription'),
    tech: ["Python", "Pandas", "Selenium", "Jupyter"],
    video: "/videos/epn-certificates.mp4",
    links: {
      [t('projects.items.certificates.links.github')]: "https://github.com/majoduan/epn-certificates-automation.git"
    }
  },
  {
    title: t('projects.items.travel.title'),
    description: t('projects.items.travel.description'),
    longDescription: t('projects.items.travel.longDescription'),
    tech: ["React", "JavaScript"],
    video: "/videos/travel-allowance.mp4",
    links: {
      [t('projects.items.travel.links.demo')]: "https://main.d2sfix2konl7t2.amplifyapp.com/Travel",
      [t('projects.items.travel.links.github')]: "https://github.com/FormsDi/FormsDi"
    }
  },
  {
    title: t('projects.items.storycraft.title'),
    description: t('projects.items.storycraft.description'),
    longDescription: t('projects.items.storycraft.longDescription'),
    tech: ["Node.js", "NestJS", "React", "SQL Server", "Docker"],
    video: "/videos/storycraft.mp4",
    links: {
      [t('projects.items.storycraft.links.github')]: "https://github.com/majoduan/StoryCraft-Project-.git"
    }
  },
  {
    title: t('projects.items.fitness.title'),
    description: t('projects.items.fitness.description'),
    longDescription: t('projects.items.fitness.longDescription'),
    tech: ["ASP.NET", "N-Layer architecture", "SQL Server"],
    video: "/videos/fitness-tracker.mp4",
    links: {
      [t('projects.items.fitness.links.github')]: "https://github.com/majoduan/Fitness-Tracker---ASP.NET-Web-Forms-Application.git"
    }
  },
  {
    title: t('projects.items.spaceInvaders.title'),
    description: t('projects.items.spaceInvaders.description'),
    longDescription: t('projects.items.spaceInvaders.longDescription'),
    tech: ["Python", "Pygame"],
    video: "/videos/space-invaders.mp4",
    links: {
      [t('projects.items.spaceInvaders.links.github')]: "https://github.com/majoduan/Space-Invaders---Python.git"
    }
  },
  {
    title: t('projects.items.godot2d.title'),
    description: t('projects.items.godot2d.description'),
    longDescription: t('projects.items.godot2d.longDescription'),
    tech: ["Godot"],
    video: "/videos/godot-game-2d.mp4",
    links: {
      [t('projects.items.godot2d.links.github')]: "https://github.com/majoduan/Godot-Game-2D.git"
    }
  },
  {
    title: t('projects.items.godot3d.title'),
    description: t('projects.items.godot3d.description'),
    longDescription: t('projects.items.godot3d.longDescription'),
    tech: ["Godot"],
    video: "/videos/godot-game-3d.mp4",
    links: {
      [t('projects.items.godot3d.links.github')]: "https://github.com/majoduan/Godot-Game-3D.git"
    }
  }
];

// Helper function to get translated certificates data
export const getCertificatesData = (t) => [
  { 
    title: t('certificates.items.epn.title'), 
    org: t('certificates.items.epn.org'), 
    icon: "🏆", 
    image: "/images/certificates/epn-award.webp" 
  },
  { 
    title: t('certificates.items.cisco.title'), 
    org: t('certificates.items.cisco.org'), 
    icon: "🌐", 
    image: "/images/certificates/cisco-networking.webp" 
  },
  { 
    title: t('certificates.items.digital.title'), 
    org: t('certificates.items.digital.org'), 
    icon: "🚀", 
    image: "/images/certificates/digital-transformation.webp" 
  },
  { 
    title: t('certificates.items.scrum.title'), 
    org: t('certificates.items.scrum.org'), 
    icon: "⚡", 
    image: "/images/certificates/scrum-foundation.webp" 
  }
];

import {
  JavaIcon,
  PythonIcon,
  CSharpIcon,
  CplusplusIcon,
  DotNetIcon,
  NodeIcon,
  ExpressIcon,
  NestIcon,
  FastAPIIcon,
  ReactIcon as ReactLogo,
  VueIcon,
  JSIcon,
  TSIcon,
  HTMLIcon,
  CSSIcon,
  TailwindIcon,
  PostgreSQLIcon,
  MySQLIcon,
  SQLServerIcon,
  MongoDBIcon,
  DockerIcon,
  GitIcon,
  AWSIcon,
  FigmaIcon,
  GodotIcon,
  UnityIcon,
  OracleIcon,
  SqliteIcon,
  FirebirdIcon,
  VercelIcon,
  RedhatIcon,
} from '../components/icons/tech';

// Helper function to get translated technology data
export const getTechnologies = (t) => ({
  backend: [
    { name: t('technologies.skills.java.name'), description: t('technologies.skills.java.description'), level: 80, experience: "3+ years", icon: JavaIcon, color: "from-orange-300 to-orange-400" },
    { name: t('technologies.skills.python.name'), description: t('technologies.skills.python.description'), level: 80, experience: "3+ years", icon: PythonIcon, color: "from-blue-400 to-blue-500" },
    { name: t('technologies.skills.csharp.name'), description: t('technologies.skills.csharp.description'), level: 80, experience: "3+ years", icon: CSharpIcon, color: "from-purple-500 to-purple-700" },
    { name: t('technologies.skills.cplusplus.name'), description: t('technologies.skills.cplusplus.description'), level: 80, experience: "3+ years", icon: CplusplusIcon, color: "from-blue-500 to-blue-700" },
    { name: t('technologies.skills.dotnet.name'), description: t('technologies.skills.dotnet.description'), level: 70, experience: "2+ years", icon: DotNetIcon, color: "from-indigo-300 to-indigo-400" },
    { name: t('technologies.skills.nodejs.name'), description: t('technologies.skills.nodejs.description'), level: 70, experience: "2+ years", icon: NodeIcon, color: "from-green-400 to-green-500" },
    { name: t('technologies.skills.express.name'), description: t('technologies.skills.express.description'), level: 40, experience: "1/2 years", icon: ExpressIcon, color: "from-gray-500 to-gray-700" },
    { name: t('technologies.skills.nestjs.name'), description: t('technologies.skills.nestjs.description'), level: 40, experience: "1/2 years", icon: NestIcon, color: "from-red-700 to-red-900" },
    { name: t('technologies.skills.fastapi.name'), description: t('technologies.skills.fastapi.description'), level: 80, experience: "2+ years", icon: FastAPIIcon, color: "from-teal-700 to-teal-900" }
  ],
  frontend: [
    { name: t('technologies.skills.react.name'), description: t('technologies.skills.react.description'), level: 90, experience: "2+ years", icon: ReactLogo, color: "from-cyan-500 to-cyan-700" },
    { name: t('technologies.skills.vue.name'), description: t('technologies.skills.vue.description'), level: 80, experience: "2+ years", icon: VueIcon, color: "from-green-600 to-green-800" },
    { name: t('technologies.skills.javascript.name'), description: t('technologies.skills.javascript.description'), level: 80, experience: "3+ years", icon: JSIcon, color: "from-yellow-400 to-yellow-600" },
    { name: t('technologies.skills.typescript.name'), description: t('technologies.skills.typescript.description'), level: 85, experience: "2+ years", icon: TSIcon, color: "from-blue-500 to-blue-700" },
    { name: t('technologies.skills.html5.name'), description: t('technologies.skills.html5.description'), level: 85, experience: "3+ years", icon: HTMLIcon, color: "from-orange-400 to-orange-500" },
    { name: t('technologies.skills.css3.name'), description: t('technologies.skills.css3.description'), level: 70, experience: "3+ years", icon: CSSIcon, color: "from-blue-400 to-blue-500" },
    { name: t('technologies.skills.tailwind.name'), description: t('technologies.skills.tailwind.description'), level: 70, experience: "1+ years", icon: TailwindIcon, color: "from-cyan-700 to-cyan-800" }
  ],
  databases: [
    { name: t('technologies.skills.postgresql.name'), description: t('technologies.skills.postgresql.description'), level: 90, experience: "3+ years", icon: PostgreSQLIcon, color: "from-blue-500 to-blue-700" },
    { name: t('technologies.skills.mysql.name'), description: t('technologies.skills.mysql.description'), level: 75, experience: "3+ years", icon: MySQLIcon, color: "from-blue-900 to-blue-1000" },
    { name: t('technologies.skills.sqlserver.name'), description: t('technologies.skills.sqlserver.description'), level: 75, experience: "3+ years", icon: SQLServerIcon, color: "from-red-500 to-orange-600" },
    { name: t('technologies.skills.mongodb.name'), description: t('technologies.skills.mongodb.description'), level: 40, experience: "1/2 years", icon: MongoDBIcon, color: "from-green-700 to-green-900" },
    { name: t('technologies.skills.oracle.name'), description: t('technologies.skills.oracle.description'), level: 75, experience: "1+ years", icon: OracleIcon, color: "from-slate-100 to-slate-300" },
    { name: t('technologies.skills.sqlite.name'), description: t('technologies.skills.sqlite.description'), level: 75, experience: "3+ years", icon: SqliteIcon, color: "from-sky-400 to-blue-600" },
    { name: t('technologies.skills.firebird.name'), description: t('technologies.skills.firebird.description'), level: 40, experience: "1/2 years", icon: FirebirdIcon, color: "from-orange-500 to-red-600" }
  ],
  devops: [
    { name: t('technologies.skills.docker.name'), description: t('technologies.skills.docker.description'), level: 75, experience: "2+ years", icon: DockerIcon, color: "from-blue-500 to-blue-700" },
    { name: t('technologies.skills.git.name'), description: t('technologies.skills.git.description'), level: 85, experience: "3+ years", icon: GitIcon, color: "from-orange-700 to-orange-900" },
    { name: t('technologies.skills.redhat.name'), description: t('technologies.skills.redhat.description'), level: 70, experience: "2+ years", icon: RedhatIcon, color: "from-red-600 to-red-800" },
    { name: t('technologies.skills.vercel.name'), description: t('technologies.skills.vercel.description'), level: 80, experience: "2+ years", icon: VercelIcon, color: "from-slate-100 to-slate-300" },
    { name: t('technologies.skills.figma.name'), description: t('technologies.skills.figma.description'), level: 90, experience: "3+ years", icon: FigmaIcon, color: "from-purple-700 to-pink-800" },
    { name: t('technologies.skills.aws.name'), description: t('technologies.skills.aws.description'), level: 40, experience: "1/2 years", icon: AWSIcon, color: "from-orange-300 to-yellow-400" },
    { name: t('technologies.skills.godot.name'), description: t('technologies.skills.godot.description'), level: 90, experience: "2+ years", icon: GodotIcon, color: "from-blue-800 to-blue-900" },
    { name: t('technologies.skills.unity.name'), description: t('technologies.skills.unity.description'), level: 40, experience: "1/2 years", icon: UnityIcon, color: "from-gray-600 to-gray-800" }
  ]
});

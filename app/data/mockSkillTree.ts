import type { SkillNode } from '~/types/skillTree'

export const mockSkillTreeData: SkillNode[] = [
  { id: 'skills', label: 'Skill Tree' },

  // Основные направления
  {
    parentIds: ['skills'],
    id: 'frontend',
    label: 'Frontend',
    descriptions: ['UI разработка, анимации и дизайн-системы.'],
    score: 75,
  },
  {
    parentIds: ['skills'],
    id: 'backend',
    label: 'Backend',
    descriptions: ['API, работа с данными и интеграции.'],
    score: 70,
  },
  {
    parentIds: ['skills'],
    id: 'ops',
    label: 'Ops',
    descriptions: ['Управление инфраструктурой и автоматизацией.'],
    score: 65,
  },

  // Frontend
  {
    parentIds: ['frontend'],
    id: 'vue',
    label: 'Vue.js',
    descriptions: ['Компонентный подход, Nuxt и рендеринг на сервере.'],
    score: 88,
  },
  {
    parentIds: ['frontend'],
    id: 'react',
    label: 'React',
    descriptions: ['Hooks, современный стек и состояние.'],
    score: 78,
  },

  // Backend
  {
    parentIds: ['backend'],
    id: 'python',
    label: 'Python',
    descriptions: ['FastAPI, автоматизация и аналитика.'],
    score: 90,
  },
  {
    parentIds: ['backend'],
    id: 'node',
    label: 'Node.js',
    descriptions: ['REST, очереди и real-time API.'],
    score: 80,
  },

  // Ops
  {
    parentIds: ['ops'],
    id: 'docker',
    label: 'Docker',
    descriptions: ['Образы, compose и оптимизация окружений.'],
    score: 72,
  },
  {
    parentIds: ['ops'],
    id: 'ci-cd',
    label: 'CI/CD',
    descriptions: ['GitHub Actions, пайплайны и релизы.'],
    score: 68,
  },

  // Примеры с несколькими родителями
  {
    parentIds: ['vue', 'python'],
    id: 'fullstack',
    label: 'Full Stack',
    descriptions: ['Связка Vue + Python для end-to-end продуктов.'],
    score: 0,
  },
  {
    parentIds: ['react', 'node', 'docker'],
    id: 'platform',
    label: 'Platform',
    descriptions: ['Шаблоны для команд, DevOps практики и поддержка.'],
    score: 100,
  },
]

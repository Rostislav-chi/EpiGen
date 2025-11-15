export interface SkillNode {
  id: string
  label: string
  parentIds?: string[] // Массив родительских узлов (может быть несколько родителей)
  descriptions?: string[] // Список описаний навыка
  score?: number // Оценка для определения цвета ноды (0-100)
}

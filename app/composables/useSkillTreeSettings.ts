import {
  SKILL_TREE_DEFAULT_SETTINGS,
  type SkillTreeSettings,
} from '~/constants/skillTree'

const cloneSettings = (settings: SkillTreeSettings): SkillTreeSettings =>
  JSON.parse(JSON.stringify(settings))

const createDefaultSettings = () => cloneSettings(SKILL_TREE_DEFAULT_SETTINGS)

export const useSkillTreeSettings = () => {
  const settings = useCookie<SkillTreeSettings>('skillTreeSettings', {
    default: createDefaultSettings,
  })

  const resetSettings = () => {
    settings.value = createDefaultSettings()
  }

  return {
    settings,
    resetSettings,
  }
}

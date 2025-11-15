type RGBColor = { r: number; g: number; b: number }

const DEFAULT_SCORE_COLOR: RGBColor = { r: 156, g: 163, b: 175 }
const DEFAULT_SCORE_BACKGROUND_COLOR: RGBColor = { r: 229, g: 231, b: 235 }

type GradientStop = {
  stop: number
  color: RGBColor
}

const SCORE_GRADIENT: GradientStop[] = [
  { stop: 0, color: { r: 239, g: 68, b: 68 } }, // lower scores - red
  { stop: 50, color: { r: 251, g: 191, b: 36 } }, // medium scores - amber
  { stop: 100, color: { r: 16, g: 185, b: 129 } }, // high scores - green
]

const clampScore = (score?: number): number | null => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null
  }

  return Math.min(100, Math.max(0, score))
}

const mixColors = (
  start: RGBColor,
  end: RGBColor,
  progress: number,
): RGBColor => {
  const safeProgress = Math.min(1, Math.max(0, progress))

  return {
    r: Math.round(start.r + (end.r - start.r) * safeProgress),
    g: Math.round(start.g + (end.g - start.g) * safeProgress),
    b: Math.round(start.b + (end.b - start.b) * safeProgress),
  }
}

const interpolateGradientColor = (score?: number): RGBColor => {
  const normalizedScore = clampScore(score)
  if (normalizedScore === null) {
    return DEFAULT_SCORE_COLOR
  }

  const firstStop = SCORE_GRADIENT[0]
  if (!firstStop) {
    return DEFAULT_SCORE_COLOR
  }

  let previousStop: GradientStop = firstStop
  for (const stop of SCORE_GRADIENT) {
    if (normalizedScore === stop.stop) {
      return stop.color
    }

    if (normalizedScore < stop.stop) {
      const range = stop.stop - previousStop.stop || 1
      const progress = (normalizedScore - previousStop.stop) / range
      return mixColors(previousStop.color, stop.color, progress)
    }

    previousStop = stop
  }

  const lastStop = SCORE_GRADIENT[SCORE_GRADIENT.length - 1]
  return (lastStop ?? firstStop).color
}

const lightenColor = (color: RGBColor, amount: number): RGBColor => ({
  r: Math.round(color.r + (255 - color.r) * amount),
  g: Math.round(color.g + (255 - color.g) * amount),
  b: Math.round(color.b + (255 - color.b) * amount),
})

const interpolateScoreColor = (score?: number): RGBColor => {
  return interpolateGradientColor(score)
}

const interpolateScoreBackgroundColor = (score?: number): RGBColor => {
  const normalizedScore = clampScore(score)
  if (normalizedScore === null) {
    return DEFAULT_SCORE_BACKGROUND_COLOR
  }

  const baseColor = interpolateScoreColor(normalizedScore)
  return lightenColor(baseColor, 0.7)
}

const toRgbString = ({ r, g, b }: RGBColor): string => `${r},${g},${b}`

export const getScoreColorRgb = (score?: number): string =>
  toRgbString(interpolateScoreColor(score))

export const getScoreBackgroundColorRgb = (score?: number): string =>
  toRgbString(interpolateScoreBackgroundColor(score))

export const getScoreColorClass = (score?: number): string => {
  const rgb = getScoreColorRgb(score)
  return `bg-[rgb(${rgb})]`
}

export const getScoreBackgroundColorClass = (score?: number): string => {
  const rgb = getScoreBackgroundColorRgb(score)
  return `bg-[rgb(${rgb})]`
}

export const getScoreFillClass = (score?: number): string => {
  const rgb = getScoreColorRgb(score)
  return `fill-[rgb(${rgb})]`
}

export const getScoreBackgroundFillClass = (score?: number): string => {
  const rgb = getScoreBackgroundColorRgb(score)
  return `fill-[rgb(${rgb})]`
}

export const getScoreStrokeClass = (score?: number): string => {
  const rgb = getScoreColorRgb(score)
  return `stroke-[rgb(${rgb})]`
}

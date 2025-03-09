export interface IDotsProps {
  stroke?: IColorSettings
  strokeWidth?: number
  size?: number
  fill?: IColorSettings
}

export interface IColorProps {
  color?: string
  colorForPositiveValues?: string
  colorForNegativeValues?: string
  opacity?: number
}

export interface ILineProps {
  strokeWidth?: number
  stroke?: IColorProps
  fill?: IColorProps
  dots?: IDotsProps
  hover?: {
    dot?: IDotsProps
  }
}

export interface IBarsProps {
  isWinLoss?: boolean
  marginPercentage?: number
  fill?: IColorProps
  hover?: {
    fill?: IColorProps
  }
}

export interface ISparkLinesProps {
  // NOTE that we do not control container (parent from which inherited), and available size can e.g. be impacted by padding
  width?: number
  height?: number
  showUndefinedValuesAs?: 'missing' | 'unchanged'
  onHoverFn?: (value?: number, label?: string) => void // showValuesOnHover
  line?: ILineProps
  bars?: IBarsProps
}

export interface ISparkLinesSettings {
  width: number
  height: number
  showUndefinedValuesAs: 'missing' | 'unchanged'
  onHoverFn?: (value?: number, label?: string) => void // showValuesOnHover
  line?: ILineSettings
  bars?: IBarsSettings
}

export interface IColorSettings {
  color: string
  colorForPositiveValues?: string
  colorForNegativeValues?: string
  opacity?: number
}

export type ILineHoverSettings = {
  dot?: IDotsSettings
}

export interface ILineSettings {
  stroke: IColorSettings
  strokeWidth: number
  fill?: IColorSettings
  dots?: IDotsSettings
  hover?: ILineHoverSettings
}

export interface IDotsSettings {
  stroke?: IColorSettings
  strokeWidth?: number
  size: number
  fill: IColorSettings
}

export interface IBarHoverSettings {
  fill?: IColorSettings
}

export interface IBarsSettings {
  isWinLoss: boolean
  marginPercentage?: number
  fill: IColorSettings
  hover?: IBarHoverSettings
}

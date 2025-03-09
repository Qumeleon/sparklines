import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

export class SparkLineGraph extends SparkLine {
  constructor(
    settings: {
      width: number
      height: number
      color?: string
      lineWidth?: number
      markers?: {
        color?: string
        size?: number
      }
    },
    values: IValues
  ) {
    super()
    const color = settings.color ?? 'currentColor'
    this.graph = new SparkLines()
    this.graph.setSettings({
      width: settings.width,
      height: settings.height,
      line: {
        stroke: {
          color
        },
        strokeWidth: settings.lineWidth,
        dots: settings.markers
          ? {
              fill: {
                color: settings.markers.color ?? color
              },
              size: settings.markers.size
            }
          : undefined
      }
    })
    this.graph.setValues(values)
  }
}

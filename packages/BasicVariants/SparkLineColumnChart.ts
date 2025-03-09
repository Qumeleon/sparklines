import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

export class SparkLineColumnChart extends SparkLine {
  constructor(
    settings: {
      width: number
      height: number
      color?: string
    },
    values: IValues
  ) {
    super()

    const color = settings.color ?? 'currentColor'
    this.graph = new SparkLines()
    this.graph.setSettings({
      width: settings.width,
      height: settings.height,
      bars: {
        marginPercentage: 15,
        fill: {
          color
        }
      }
    })
    this.graph.setValues(values)
  }
}

import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

/**
 * Create a new SparkLines with bars, a column chart
 *
 */
export class SparkLineColumnChart extends SparkLine {
  /**
   * Create a new SparkLines with bars, a column chart
   *
   * @param settings - Settings for the bars graph
   * @param settings.width - Width of the graph
   * @param settings.height - Height of the graph
   * @param settings.color - Color of the bars, defaults to 'currentColor'
   * @param values - Array of numeric values to use for the line graph
   *
   */
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

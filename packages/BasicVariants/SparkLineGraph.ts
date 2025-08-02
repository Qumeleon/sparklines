import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

/**
 * Create a new SparkLines, as a line graph
 *
 * This is a convenience wrapper around the generic {@link SparkLines} class
 *
 */
export class SparkLineGraph extends SparkLine {
  /**
   * Create a new SparkLines, as a line graph
   *
   * This is a convenience wrapper around the generic {@link SparkLines} class
   *
   * @param settings - Settings for the line graph
   * @param settings.width - Width of the graph
   * @param settings.height - Height of the graph
   * @param settings.color - Color of the line, defaults to 'currentColor'
   * @param settings.lineWidth - Width of the line
   * @param settings.markers - Settings for the markers (dots) of the values on the graph
   * @param settings.markers.color - Color of the markers, defaults to 'currentColor'
   * @param settings.markers.size - Size of the markers
   * @param values - Array of numeric values to use for the line graph
   *
   */
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

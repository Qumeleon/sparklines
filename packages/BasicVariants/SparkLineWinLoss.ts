import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

/**
 * Create a new SparkLines win/loss chart
 *
 * This is basically a bars SparkLine (column chart) with equal heights for win (positive value) and loss (negative value)
 *
 */
export class SparkLineWinLoss extends SparkLine {
  /**
   * Create a new SparkLines win/loss chart
   *
   * @param settings - Settings for the win/loss graph
   * @param settings.width - Width of the graph
   * @param settings.height - Height of the graph
   * @param settings.colorWin - Color of the 'win' bars, defaults to 'currentColor'
   * @param settings.colorLoss - Color of the 'loss' bars, defaults to 'currentColor'
   * @param values - Array of numeric values to use for the line graph
   *
   */
  constructor(
    settings: {
      width: number
      height: number
      colorWin?: string
      colorLoss?: string
    },
    values: IValues
  ) {
    super()
    const colorWin = settings.colorWin ?? 'green'
    const colorLoss = settings.colorLoss ?? 'red'
    this.graph = new SparkLines()
    this.graph.setSettings({
      width: settings.width,
      height: settings.height,
      bars: {
        isWinLoss: true,
        marginPercentage: 15,
        fill: {
          colorForPositiveValues: colorWin,
          colorForNegativeValues: colorLoss
        }
      }
    })
    this.graph.setValues(values)
  }
}

import { IValues, SparkLines } from '../SparkLines'
import { SparkLine } from './SparkLine.ts'

export class SparkLineWinLoss extends SparkLine {
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

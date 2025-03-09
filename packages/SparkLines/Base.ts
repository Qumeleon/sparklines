import { IPoint } from './types'
import { IDimensions } from './SVG/Dimensions.ts'
import { Logger } from './Logger'

export class Base {
  protected readonly points: IPoint[]
  protected readonly dimensions: IDimensions
  protected readonly logger: Logger

  getCoordinates(point: { x: number; y?: number }): {
    x: number
    y?: number
  } {
    const { x, y } = point
    // When mapping points to SVG it is flipped vertically
    return {
      x,
      y: y != null ? (y !== 0 ? -y : y) : undefined
    }
  }

  constructor(points: IPoint[] = [], dimensions: IDimensions, logger: Logger) {
    this.points = points
    this.dimensions = dimensions
    this.logger = logger
  }
}

import {IBarsSettings} from '../Settings/ISparkLinesSettings'
import { Base } from '../Base.ts'
import { IPoint } from '../types.ts'
import { IRectangleProps } from '../SVG/types.ts'
import { Renderer } from '../SVG/Renderer.ts'
import { IDimensions } from '../SVG/Dimensions.ts'
import { Logger } from '../Logger'

export class Bars extends Base {
  private readonly settings: IBarsSettings

  // get the graph as a path consisting of lines only
  private getBars(points: IPoint[]): IRectangleProps[] {
    return points
        .flatMap((point) => {
          if (point?.y == null) {
            return []
          }
          const coord = this.getCoordinates(point)
          if (coord?.y == null) {
            return []
          }
          const barsMargin = this.settings.marginPercentage != null
              ? this.settings.marginPercentage / 100 * this.dimensions.stepWidth / 2
              : 0
          const x = (coord.x - 1) // svg starts at zero instead of 1
              * this.dimensions.stepWidth + barsMargin
          const y = (point.y < 0 ? 0 : coord.y)
          const width = this.dimensions.stepWidth - (barsMargin * 2)
          // a zero point is not displayed, it is a zero height bar, this is consistent with e.g. excel behaviour
          const height = Math.abs(coord?.y)
          // determine value
          return [{
                x,
                y,
                value: point.value,
                xLabel: point.xLabel,
                width,
                height,
                fill: (point.y ?? 0) === 0
                    ? this.settings.fill.colorForPositiveValues ?? this.settings.fill.color
                    : (point.y ?? 0) > 0
                        ? this.settings.fill.colorForPositiveValues ?? this.settings.fill.color
                        : this.settings.fill.colorForNegativeValues ?? this.settings.fill.color,
                fillOpacity: this.settings.fill.opacity != null ? this.settings.fill.opacity : undefined
          }]
        })
  }

  draw() {
    const linesContainer = Renderer.makeGroup({
        translate: {
            x: this.dimensions.marginX,
            y: this.dimensions.marginY
        }
    })
    this.getBars(this.points).forEach(bar => linesContainer.appendChild(Renderer.makeRectangle(bar)))
    return linesContainer
  }

  constructor(
    points: IPoint[] = [],
    dimensions: IDimensions,
    settings: IBarsSettings,
    logger: Logger
  ) {
    super(points, dimensions, logger)
    this.settings = settings
  }
}

import { Base } from '../Base.ts'
import { ILineSettings } from '../Settings/ISparkLinesSettings.ts'
import { IPoint } from '../types.ts'
import { ICircleProps, IPathProps } from '../SVG/types.ts'
import { Renderer } from '../SVG/Renderer.ts'
import { IDimensions } from '../SVG/Dimensions.ts'
import { Logger } from '../Logger'

export class Lines extends Base {
  private readonly settings: ILineSettings

  // get the graph as a path consisting of lines only
  private getLines(points: IPoint[], centerAlign: boolean): IPathProps {
    // determine line color
    const hasNegativeValues = points.some((p) => p.y != null && p.y < 0)
    const lineColor = hasNegativeValues
      ? (this.settings.stroke.colorForNegativeValues ??
        this.settings.stroke.color)
      : (this.settings.stroke.colorForPositiveValues ??
        this.settings.stroke.color)

    return {
      fill: 'none',
      stroke: lineColor,
      strokeWidth: this.dimensions.pixelSize * this.settings.strokeWidth,
      strokeOpacity: this.settings.stroke.opacity != null ? this.settings.stroke.opacity : undefined,
      points: points.map((point) => {
        const coord = this.getCoordinates(point)
        // when e.g. using with bars it needs to be positioned in the middle of a bar
        return {
          x: centerAlign
              ? (point.x - 1) * this.dimensions.stepWidth +
              this.dimensions.stepWidth / 2
              : (point.x - 1) * this.dimensions.xStep,
          y: coord.y
        }
      })
    }
  }

  // get the graph as a path consisting of lines wit fill
  private getLinesWithFill(points: IPoint[]): IPathProps {
    if (!this.settings.fill) {
      throw new Error('Fill is not specified')
    }

    // add start/end points at zero y, as it needs to be filled so we need extra 'lines' to close the path
    // note that this eliminates the need for a Z to close the path
    const startPoint = points[0]
    const endPoint = points[points.length - 1]
    const graphPoints = [
      { x: startPoint.x, y: 0 },
      ...points,
      { x: endPoint.x, y: 0 }
    ]

    // determine line color
    // only when not showing dots (these will have the pos/neg colors
    const hasNegativeValues = points.some((p) => p.y != null && p.y < 0)
    const lineColor = hasNegativeValues
      ? (this.settings.fill?.colorForNegativeValues ??
        this.settings.fill?.color)
      : (this.settings.fill?.colorForPositiveValues ??
        this.settings.fill?.color)

    return {
      fill: lineColor,
      fillOpacity: this.settings.fill.opacity != null ? this.settings.fill.opacity : undefined,
      stroke: 'none',
      points: graphPoints.map((point) => {
        const coord = this.getCoordinates(point)
        return {
          x:
            (point.x - 1) * // svg starts at zero instead of 1
              this.dimensions.xStep,
          y: coord.y
        }
      })
    }
  }

  private getDots(points: IPoint[], centerAlign: boolean): ICircleProps[] {
    // make the dots
    return points.flatMap((point) => {
      if (!this.settings.dots) {
        throw new Error('Dots not specified in settings')
      }
      if (point?.y == null) {
        return []
      }
      const coord = this.getCoordinates(point)
      if (coord?.y == null) {
        return []
      }
      const dots = this.settings.dots
      // when using with bars it needs to be positioned in the middle of a bar
      return [
        {
          value: point.value,
          xLabel: point.xLabel,
          centerX: centerAlign
              ? (point.x - 1) * this.dimensions.stepWidth +
              this.dimensions.stepWidth / 2
              : (point.x - 1) * this.dimensions.xStep,
          centerY: coord.y,
          radius: (dots.size * this.dimensions.pixelSize) / 2,
          stroke: dots.stroke?.color,
          strokeWidth: dots.strokeWidth ? dots.strokeWidth * this.dimensions.pixelSize : undefined,
          fill:
            (point.y ?? 0) === 0
              ? dots.fill.color
              : (point.y ?? 0) > 0
                ? (dots.fill.colorForPositiveValues ??
                  dots.fill.color)
                : (dots.fill.colorForNegativeValues ??
                  dots.fill.color),
          fillOpacity: dots.fill.opacity != null ? dots.fill.opacity : undefined
        }
      ]
    })
  }

  // for displaying negative and positive lines (paths) in different colors we need to add the zero y points
  // lines above zero y will be e.g. green and below red
  // also when points are missing the graph should be interrupted, not showing a value at that x, leading to 2 graphs
  private getGraphPointsSegments(): IPoint[][] {
    let currentGraph: IPoint[] = []
    const graphs: IPoint[][] = [currentGraph]
    let previousPoint: IPoint | undefined = undefined
    for (const point of this.points) {
      // when this point has no y
      if (point.y == null) {
        // just start a new graph
        currentGraph = []
        graphs.push(currentGraph)
      }
      // when line goes through zero
      else if (
        previousPoint?.y != null &&
        ((previousPoint.y > 0 && point.y <= 0) ||
          (previousPoint.y < 0 && point.y > 0))
      ) {
        // calculate point on the zero y
        const b = point.x - previousPoint.x
        const a = Math.abs(previousPoint.y - point.y)
        const a1 = Math.abs(previousPoint.y)
        const xDelta = (a1 * b) / a
        // add an 'end' point on the current graph at zero y
        currentGraph.push({
          x: previousPoint.x + xDelta,
          y: 0
        })
        // start a new graph, on which the current point can just be added next
        currentGraph = []
        graphs.push(currentGraph)
        // add a 'start' point on the next (current) graph at zero y
        currentGraph.push({
          x: previousPoint.x + xDelta,
          y: 0
        })
        currentGraph.push(point)
      } else {
        currentGraph.push(point)
      }
      previousPoint = { ...point }
    }
    // return only nonempty
    return graphs.flatMap((g) => (g.length > 0 ? [g] : []))
  }

  draw(centerAlign = false) {
    const container = Renderer.makeGroup({
      translate: {
        x: this.dimensions.marginX,
        y: this.dimensions.marginY
      }
    })
    // warn if clutter might occur, when nbr of values exceeds the width
    if (this.dimensions.stepWidth < 1) {
      this.logger.warn('Strokes and dots can look cluttered because the number of values exceeds the width of the sparkline')
    }
    // lines first, these need to be behind dots
    const linesContainer = Renderer.makeGroup()
    this.getGraphPointsSegments().forEach((coll) => {
      if (this.settings.fill) {
        const lines = this.getLinesWithFill(coll)
        if (lines.points.length > 0) {
          linesContainer.appendChild(
            Renderer.makeLinesPath(lines)
          )
        } else {
          this.logger.warn('Linefill had no points')
        }
      }
      // and add the lines, which form the edge stroke in case of filled
      const lines = this.getLines(coll, centerAlign)
      if (lines.points.length > 0) {
        linesContainer.appendChild(Renderer.makeLinesPath(lines))
      } else {
        this.logger.warn('Line had no points')
      }
    })
    container.appendChild(linesContainer)
    // then dots
    if (this.settings.dots) {
      // const circlesContainer = Renderer.makeGroup()
      const circlesContainer = Renderer.makeGroup()
      const dots = this.getDots(this.points, centerAlign)
      dots.forEach((dot) => {
        circlesContainer.appendChild(Renderer.makeCircle(dot))
      })
      container.appendChild(circlesContainer)
    }
    return container
  }

  constructor(
      points: IPoint[] = [],
      dimensions: IDimensions,
      settings: ILineSettings,
      logger: Logger
  ) {
    super(points, dimensions, logger)
    this.settings = settings
  }
}

import { IPoint } from '../types.ts'
import { IBoxProps } from './types.ts'

export interface IDimensions {
  marginX: number
  marginY: number
  pixelSize: number
  xStep: number
  stepWidth: number
  box: IBoxProps
}

export class Dimensions {
  private readonly dimensions: IDimensions

  get props() {
    return {
      ...this.dimensions,
      box: { ...this.dimensions.box }
    }
  }

  private getDimensions(
    width: number,
    height: number,
    points: IPoint[],
    dotSize?: number
  ): IDimensions {
    // get boundaries for x/y
    const xVals = Array.from(new Set(points.map((point) => point.x)))
    const yVals = Array.from(
      new Set(points.flatMap((point) => (point.y != null ? [point.y] : [])))
    )

    if (!Number.isFinite(height)) {
      throw new Error('Sparkline cannot be rendered as it will contain infinite height, please check width and ratio settings')
    }

    const minVal = yVals.length > 0 ? Math.min(...yVals) : 0
    const maxVal = yVals.length > 0 ? Math.max(...yVals) : 0
    const valueRange = Math.max(maxVal - minVal, 1)

    // svg height is determined by the values range only plus an overflow margin for visuals like dots
    // for this the needed increase on both min and max is determined using dot size and scale
    const scale = valueRange / height
    // currently only dot size impacts this
    const overflowSize = (dotSize ?? 1)
    const enlargeAxesBy = scale  * overflowSize

    // add overflow, plus 1 extra on each side to account for rendering differences
    // a circle with cx/cy 5/5 and radius 5 for instance can actually be rendered at 4.5/4.5
    const minY = minVal - enlargeAxesBy / 2 - 1
    const maxY = maxVal + enlargeAxesBy / 2 + 1
    const svgHeight = Math.max(maxY - minY, 1)
    // svg width is derived from height and ratio
    const svgWidth = svgHeight * (width / height)
    if (!Number.isFinite(svgWidth) || !Number.isFinite(svgHeight)) {
      throw new Error('Sparkline cannot be rendered as it will contain infinite dimensions, please check settings like width and given values')
    }

    // how many units is a pixel ? this is needed to calculate e.g. stroke from line width but also dot size given in px
    const pixelSize = svgHeight / height
    if (!Number.isFinite(pixelSize)) {
      throw new Error('Sparkline cannot be rendered as it will contain infinite pixels, please check settings like width and given values')
    }

    // use a margin to prevent overflowing dots (with size > 1) being rendered partially outside the SVG
    // this margin will apply both horizontal as vertical, but note that the height vs width * ratio still
    // need to be correct
    // in future iterations this is were margins for e.g. texts along y axis will be placed
    const marginX = pixelSize * overflowSize / 2
    if (!Number.isFinite(marginX)) {
      throw new Error('Sparkline cannot be rendered as it will contain infinite margins, please check settings like width and given values')
    }

    // how wide is an x value
    // for graphs
    const xStep =
      xVals.length > 1 ? (svgWidth - marginX * 2) / (xVals.length - 1) : svgWidth
    // for bars
    const stepWidth =
      xVals.length > 0 ? (svgWidth - marginX * 2) / xVals.length : svgWidth
    if (!Number.isFinite(xStep) || !Number.isFinite(stepWidth)) {
      throw new Error('Sparkline cannot be rendered as it will contain infinite intervals, please check settings like width and given values')
    }

    return {
      marginX,
      marginY: 0,
      pixelSize,
      xStep,
      stepWidth,
      box: {
        x: 0,
        y: -maxY,
        width: svgWidth,
        height: svgHeight
      }
    }
  }

  constructor(
    width: number,
    height: number,
    points: IPoint[],
    dotSize?: number
  ) {
    this.dimensions = this.getDimensions(width, height, points, dotSize)
  }
}

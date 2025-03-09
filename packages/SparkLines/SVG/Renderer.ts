import {
  IBoxProps,
  ICircleProps, ICoordinates,
  IPathProps,
  IRectangleProps,
  ITransformProps
} from './types.ts'
import {XMLNS} from './constants.ts'

export class Renderer {
  static makeSVG(viewBox: IBoxProps) {
    const svgElement = document.createElementNS(XMLNS, 'svg')
    svgElement.setAttributeNS(null, 'version', '1.1')
    svgElement.setAttributeNS(
      null,
      'viewBox',
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    )
    return svgElement
  }

  private static getTranslateStr(props: ICoordinates): string {
    return `translate(${props.x} ${props.y})`
  }

  private static getScaleStr(props: ICoordinates): string {
    return `scale(${props.x} ${props.y})`
  }

  static getTransformStr(props: ITransformProps): string | undefined {
    if (props.scale || props.translate) {
      const attrStr =
        `${props.translate ? Renderer.getTranslateStr(props.translate) : ''} ${props.scale ? Renderer.getScaleStr(props.scale) : ''}`.trim()
      return attrStr.length === 0 ? undefined : attrStr
    }
    return undefined
  }

  static makeGroup(props?: ITransformProps) {
    const groupEl = document.createElementNS(XMLNS, 'g')
    const attrStr = props ? Renderer.getTransformStr(props) : undefined
    if (attrStr) {
      groupEl.setAttributeNS(null, 'transform', attrStr)
      groupEl.setAttributeNS(null, 'transform-origin', 'center')
    }
    return groupEl
  }

  static makeCircleComp(props: ICircleProps) {
    const { centerX, centerY, radius, fillOpacity, value, xLabel } = props
    const pathEl = document.createElementNS(XMLNS, 'path')
    pathEl.setAttributeNS(null, 'data-value', value?.toString() ?? 'none')
    pathEl.setAttributeNS(null, 'data-y', centerY?.toString() ?? 'none')
    pathEl.setAttributeNS(null, 'data-x', centerX?.toString() ?? 'none')
    pathEl.setAttributeNS(null, 'data-radius', radius?.toString() ?? 'none')
    pathEl.setAttributeNS(null, 'fill', props.fill)
    if (xLabel != null) {
      pathEl.setAttributeNS(null, 'data-x-label', xLabel)
    }
    if (fillOpacity != null) {
      pathEl.setAttributeNS(null, 'fill-opacity', fillOpacity.toString())
    }
    pathEl.setAttributeNS(
      null,
      'd',
      `M ${centerX} ${centerY} m ${radius}, 0 a ${radius},${radius} 0 1,0 ${-(radius * 2)},0 a ${radius},${radius} 0 1,0  ${radius * 2},0`
    )
    return pathEl
  }

  // note that this is not a standard SVG circle, having a stroke (border)
  static makeCircle(props: ICircleProps) {
    const { centerX, centerY, radius, fill, stroke, strokeWidth, fillOpacity, value, xLabel } = props
    // note that only one of stroke or width being filled will lead to an error in settings
    if (stroke != null && strokeWidth != null) {
      const comp = this.makeGroup()
      // attach the outer circle (the border aka stroke)
      comp.appendChild(this.makeCircleComp({
        centerX,
        centerY,
        radius, // note that this behaves like border-box
        fill: stroke,
        fillOpacity,
        value,
        xLabel
      }))
      // attach the inner circle (the fill)
      comp.appendChild(this.makeCircleComp({
        centerX,
        centerY,
        radius: radius - strokeWidth, // note that this behaves like border-box
        fill,
        fillOpacity: fillOpacity,
        value: value,
        xLabel: xLabel
      }))
      return comp
    } else {
      return this.makeCircleComp(props)
    }
  }

  static getRectanglePath(x: number, y: number, width: number, height: number) {
    const renderHeight = Math.max(height, 1)
    return `M ${x} ${y} l ${width} 0 l 0 ${renderHeight} l ${-width} 0 l 0 ${-renderHeight}`
  }

  static makeText(x: number, y: number, text: string, fontSize: number) {
    const textEl = document.createElementNS(XMLNS, 'text')
    textEl.setAttributeNS(null, 'x', x.toString())
    textEl.setAttributeNS(null, 'y', y.toString())
    textEl.setAttributeNS(null, 'width', '100')
    textEl.setAttributeNS(null, 'font-size', fontSize.toString())
    var textNode = document.createTextNode(text)
    textEl.appendChild(textNode)
    return { textEl, textNode }
  }

  static makeLinePath(x1: number, y1: number, x2: number, y2: number, stroke: string, width: number) {
    const pathEl = document.createElementNS(XMLNS, 'path')
    pathEl.setAttributeNS(
      null,
      'd',
      `M ${x1} ${y1} L ${x2} ${y2}`
    )
    pathEl.setAttributeNS(null, 'stroke', stroke)
    pathEl.setAttributeNS(null, 'stroke-width', width.toString())
    pathEl.setAttributeNS(null, 'stroke-dasharray', '2')
    // pathEl.setAttributeNS(null, 'fill', fill)
    return pathEl
  }

  static makeRectangle(props: IRectangleProps) {
    const {
      x,
      y,
      width,
      height,
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      strokeWidth,
      value,
      xLabel
    } = props
    const pathEl = document.createElementNS(XMLNS, 'path')
    pathEl.setAttributeNS(null, 'data-value', value?.toString() ?? 'none')
    pathEl.setAttributeNS(null, 'data-y', y?.toString() ?? 'none')
    if (xLabel != null) {
      pathEl.setAttributeNS(null, 'data-x-label', xLabel)
    }
    // paths with height less than 1 are not always rendered visibly on firefox, a minimum of 1 has no impact visually for e.g. chrome
    pathEl.setAttributeNS(
      null,
      'd',
      this.getRectanglePath(x, y, width, height)
    )
    pathEl.setAttributeNS(null, 'fill', fill)
    if (fillOpacity != null) {
      pathEl.setAttributeNS(null, 'fill-opacity', fillOpacity.toString())
    }
    if (stroke) {
      pathEl.setAttributeNS(null, 'stroke', stroke)
      if (strokeOpacity != null) {
        pathEl.setAttributeNS(null, 'stroke-opacity', strokeOpacity.toString())
      }
      if (strokeWidth != null) {
        pathEl.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
      }
    }
    // prevent tiny spacing between bars in chrome
    pathEl.setAttributeNS(null, 'shape-rendering', 'crispEdges')
    return pathEl
  }

  static makeLinesPath(props: IPathProps) {
    if (props.points.length === 0) {
      throw new Error('Cannot create a path for lines without points')
    }
    const { fill, fillOpacity, stroke, strokeWidth, strokeOpacity, points } =
      props
    const pathEl = document.createElementNS(XMLNS, 'path')
    pathEl.setAttributeNS(
      null,
      'd',
      points
        .flatMap((point, index) => {
          return point.y != null
            ? [`${index > 0 ? 'L' : 'M'} ${point.x} ${point.y}`]
            : []
        })
        .join(' ')
    )
    pathEl.setAttributeNS(null, 'fill', fill)
    if (fillOpacity != null) {
      pathEl.setAttributeNS(null, 'fill-opacity', fillOpacity.toString())
    }
    if (stroke) {
      pathEl.setAttributeNS(null, 'stroke', stroke)
      if (strokeOpacity != null) {
        pathEl.setAttributeNS(null, 'stroke-opacity', strokeOpacity.toString())
      }
      if (strokeWidth != null) {
        pathEl.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
      }
    }
    return pathEl
  }
}

// note that this could also be implemented by manipulating dots/bars in the SVG on hovers
// however this approach, using separate hover elements, basically introduces an overlay which e.g. enables shading
import { IDimensions } from '../SVG/Dimensions.ts'
import { Renderer } from '../SVG/Renderer.ts'
import { IBarHoverSettings, ILineHoverSettings } from '../Settings/ISparkLinesSettings.ts'
import { IIndexedPoint } from '../types.ts'

export class HoverMarker {
  protected readonly dimensions: IDimensions
  private readonly container: SVGElement
  protected markerEl: SVGElement
  protected valueEl?: SVGPathElement | SVGElement

  getSVG() {
    return this.container
  }

  show() {
    this.markerEl?.setAttributeNS(null, 'style', 'visibility: visible')
  }

  hide() {
    this.markerEl?.setAttributeNS(null, 'style', 'visibility: hidden')
  }

  protected setMarkerAtPointX(x: number): void {
  // protected setMarkerAtPointX(x: number, y: number, label?: string): void {
    if (this.markerEl) {
      const transformP = Renderer.getTransformStr({
        translate: {
          x: x,
          y: 0
        }
      })
      if (transformP) {
        this.markerEl.setAttributeNS(null, 'transform', transformP)
      }
    }
  }

  constructor(dimensions: IDimensions) {
    this.dimensions = dimensions
    this.container = Renderer.makeGroup({
      translate: {
        x: this.dimensions.marginX,
        y: this.dimensions.marginY
      }
    })
    this.markerEl = Renderer.makeGroup()
    this.container.appendChild(this.markerEl)
  }
}

export class HoverMarkerLines extends HoverMarker {
  private readonly settings: ILineHoverSettings

  setAtPointIndex(point: IIndexedPoint): void {
    if (point?.y != null) {
      if (this.valueEl) {
        // marker dots needs to be correctly places vertically based on point
        const transformV = Renderer.getTransformStr({
          translate: {
            x: 0,
            y: point.y !== 0 ? -point.y : point.y
          }
        })
        if (transformV) {
          this.valueEl.setAttributeNS(null, 'transform', transformV)
        }
      }
      this.setMarkerAtPointX( point.markerIndex.xCoordMarker)
    }
  }

  private makeCircle() {
    if (this.settings.dot) {
      this.valueEl = Renderer.makeCircle({
        centerX: 0,
        centerY: 0,
        radius: this.settings.dot.size * this.dimensions.pixelSize / 2,
        stroke: this.settings.dot.stroke?.color,
        strokeWidth: this.settings.dot.strokeWidth ? this.settings.dot.strokeWidth * this.dimensions.pixelSize : undefined,
        fill: this.settings.dot.fill.color ?? 'transparent',
        fillOpacity: this.settings.dot.fill.opacity
      })
      this.valueEl.setAttributeNS(null, 'transform-origin', 'center')
      this.markerEl.appendChild(this.valueEl)
    }
  }

  constructor(settings: ILineHoverSettings, dimensions: IDimensions) {
    super(dimensions)
    this.settings = settings
    this.makeCircle()
  }
}

export class HoverMarkerBars extends HoverMarker {
  private readonly settings: IBarHoverSettings

  setAtPointIndex(point: IIndexedPoint): void {
    if (point?.y != null) {
      if (this.valueEl) {
        // marker bar needs to have correct y position and width based on point
        const width = this.dimensions.stepWidth
        this.valueEl.setAttributeNS(
          null,
          'd',
          Renderer.getRectanglePath(0, (point.y < 0 ? 0 : (point.y !== 0 ? -point.y : point.y)), width, Math.abs(point.y))
        )
      }
      this.setMarkerAtPointX(point.markerIndex.xCoordMarker)
    }
  }

  private makeRectangle() {
    if (this.settings.fill) {
      this.valueEl = Renderer.makeRectangle({
        x: 0,
        y: 0,
        width: this.dimensions.stepWidth,
        height: 0,
        fill: this.settings.fill?.color,
        fillOpacity: this.settings.fill.opacity
      })
      this.valueEl.setAttributeNS(null, 'transform-origin', 'center')
      this.markerEl.appendChild(this.valueEl)
    }
  }

  constructor(settings: IBarHoverSettings, dimensions: IDimensions) {
    super(dimensions)
    this.settings = settings
    this.makeRectangle()
  }
}

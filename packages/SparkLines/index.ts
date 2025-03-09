import {ILogger, Logger, loggerStub} from './Logger'
import { Dimensions, IDimensions } from './SVG/Dimensions.ts'
import {Renderer} from './SVG/Renderer.ts'
import {IIndexedPoint, IMarkerIndex, IPoint} from './types.ts'
import { anyValueToNumber } from './shared.ts'
import { Settings } from './Settings'
import { HoverMarkerBars, HoverMarkerLines } from './Hover'
import { Bars } from './Bars'
import { Lines } from './Lines'
import { ISparkLinesProps } from './Settings/ISparkLinesSettings.ts'

type ILabeledValue = {
  label: string
  value?: number | string
}

type IPlainValue = number | string | undefined

export type IValues = ILabeledValue[] | IPlainValue[]

const WIN_VALUE = 1
const LOSS_VALUE = -1

export class SparkLines {
  private readonly el: HTMLDivElement = document.createElement('div')
  private settings?: Settings
  private points: IPoint[] = []
  private values?: IValues
  private hasError = false
  private readonly logger: Logger
  private readonly id?: string
  private readonly errorsUseConsole: boolean

  private sortPoints() {
    this.points.sort((a, b) => a.x - b.x)
  }

  private getXCoordBarOrDot(x: number, xWidth: number, hasLines: boolean, hasBars: boolean): IMarkerIndex {
    if (hasBars && hasLines) {
      const thresHold = xWidth / 2
      const xCoordMarker = (x - 1) * xWidth + thresHold
      return {
        xFrom: xCoordMarker - thresHold,
        xCoordMarker,
        xTo: xCoordMarker + thresHold
      }
    } else if (hasBars) {
      const xCoordMarker = (x - 1) * xWidth
      return {
        xFrom: xCoordMarker,
        xCoordMarker,
        xTo: xCoordMarker + xWidth
      }
    } else {
      // lines only
      const thresHold = xWidth / 2
      const xCoordMarker = (x - 1) * xWidth
      return {
        xFrom: xCoordMarker - thresHold,
        xCoordMarker,
        xTo: xCoordMarker + thresHold
      }
    }
  }

  private getPointsIndex(dimensions: IDimensions, hasLines: boolean, hasBars: boolean): IIndexedPoint[] {
    const xWidth = hasBars ? dimensions.stepWidth : dimensions.xStep
    return this.points.map((p) => {
      return {
        ...p,
        markerIndex: this.getXCoordBarOrDot(p.x, xWidth, hasLines, hasBars)
      }
    }).sort((a, b) => b.x - a.x)
  }

  private scalePoints(settings: Settings) {
    const orgPoints: IPoint[] = Array.from(new Set(this.points))
    // determine value range
    const yVals = Array.from(
      new Set(this.points.flatMap((point) => (point.y != null ? [point.y] : [])))
    )
    const minY = yVals.length > 0 ? Math.min(...yVals) : 0
    const maxY = yVals.length > 0 ? Math.max(...yVals) : 0
    const range = Math.max(maxY - minY, 1)

    // scale values to y to get as close a possible to the display dimensions
    let yFactor: { v: number; op: '*' | '/' } = {
      v: 1,
      op: '*'
    }

    //
    // scale down large values, as these cause rendering issues in firefox/safari
    //
    // see https://oreillymedia.github.io/Using_SVG/extras/ch08-precision.html
    // from 2017 but might still be wise to follow in 2025 as firefox still has issues with larger values (> 7M)
    // however with a threshold of 7M we still see rendering issue with circles overflowing the viewport slightly
    // in graphs with very large values
    // so for now lets use the safe threshold of 5000, which does not show these issues
    if (range > 5000) {
      yFactor = {
        v: Math.floor(range / settings.height),
        op: '/'
      }
    }

    // and scale up small values, as viewport height < 1 also leads to rendering issues
    if (settings.height > range) {
      yFactor = {
        v: Math.ceil(settings.height / range),
        op: '*'
      }
    }

    // apply factor to points
    this.points = orgPoints.map((p) => {
      const y = p.y != null
        ? yFactor.op === '*'
          ? p.y * yFactor.v
          : p.y / yFactor.v
        : undefined
      if (y != null && !Number.isFinite(y)) {
        throw new Error('Sparkline cannot be rendered as it will contain infinite numbers, please check settings like width and given values')
      }
      return {
        x: p.x,
        xLabel: p.xLabel,
        y,
        value: p.y
      }
    })
  }

  private determinePointValue(value?: number): number | undefined {
    if (value == null || !this.settings?.bars?.isWinLoss) {
      return value
    }
    // win/loss
    switch (Math.sign(value)) {
      case 1:
        return WIN_VALUE
      case -1:
        return LOSS_VALUE
      default:
        return value
    }
  }

  private validateAndSetValues(values: string | IValues) {
    const valueObj = typeof values === 'string' ? JSON.parse(values) : values

    if (!Array.isArray(valueObj)) {
      throw new Error('points must be an Array')
    }
    if (valueObj.length === 0) return []

    for (let i = 0; i < valueObj.length; i++) {
      // in this variant we just set the value so the lines/bars/dot do not needed changes, and add a property optionally for specific styles to apply in this case
      const pointObj = valueObj[i]
      if (pointObj != null && typeof pointObj === 'object') {
        if (pointObj.label == null) {
          throw new Error('value object must have a label')
        }
      }
    }

    this.values = valueObj
  }

  private mapValuesToPoints(valueObj?: IValues): IPoint[] {

    if (valueObj == null || valueObj.length === 0) return []

    const points: IPoint[] = []
    let lastPointValue: number | undefined = undefined
    for (let i = 0; i < valueObj.length; i++) {
      // in this variant we just set the value so the lines/bars/dot do not needed changes, and add a property optionally for specific styles to apply in this case
      const pointObj = valueObj[i]
      const x = i + 1
      if (pointObj == null || typeof pointObj !== 'object') {
        const value = anyValueToNumber(pointObj == null && (this.settings?.showUndefinedValuesAs ?? 'missing') === 'unchanged' ? lastPointValue : pointObj)
        const y = this.determinePointValue(value)
        // array of values
        points.push({
          x,
          y: this.determinePointValue(value)
        })
        lastPointValue = y
      } else {
        const value = anyValueToNumber(pointObj.value == null && (this.settings?.showUndefinedValuesAs ?? 'missing') === 'unchanged' ? lastPointValue : pointObj.value)
        const y = this.determinePointValue(value)
        points.push({
            x,
            xLabel: pointObj.label,
            y
        })
        lastPointValue = y
      }
    }

    return points
  }

  setError(e: Error) {
    this.el.textContent = this.errorsUseConsole ? 'Sparklines error (check console)' : 'Sparklines error'
    // Attach the created elements to the shadow dom
    this.el.setAttribute('style', 'color: red; font-size: smaller; font-weight: bold')
    this.hasError = true
    this.logger.error(e)
  }

  clearAll() {
    this.hasError = false
    this.el.innerHTML = ''
    this.el.removeAttribute('style')
  }

  hoverAction(e: MouseEvent, view: SVGSVGElement, dims: IDimensions, pointsIdx: IIndexedPoint[], onHoverFn?: (value?: number, label?: string) => void , hoverMarker?: HoverMarkerLines | HoverMarkerBars) {
    const bBox = view.getBoundingClientRect()
    const scale = dims.box.width / bBox.width
    const x = (e.clientX - bBox.left) * scale
    const point = pointsIdx.find(p => p.markerIndex.xFrom <= x && p.markerIndex.xTo >= x)

    if (hoverMarker) {
      if (point?.y != null) {
        hoverMarker.setAtPointIndex(point)
        hoverMarker.show()
      } else {
        hoverMarker.hide()
      }
    }
    if (point != null && onHoverFn) {
      onHoverFn(point.value, point.xLabel)
    }
  }

  render() {
    // if settings are not specified at this point, use the default
    if (!this.settings) {
      this.settings = new Settings()
    }
    try {
      // maps values to points
      this.points = this.mapValuesToPoints(this.values)
      // points are always needed, or else an empty graph is drawn, just give a warning
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }
      this.setError(e)
    }
    if ((this.points ?? []).length === 0) {
      this.logger.warn('Cannot draw sparklines without values')
    }
    if (this.hasError) return this.el
    try {
      this.clearAll()
      this.scalePoints(this.settings)
      this.sortPoints()
      const dims = new Dimensions(
        this.settings.width,
        this.settings.height,
        this.points,
        this.settings.line?.hover?.dot?.size ?? this.settings.dotSize
      )
      const view = Renderer.makeSVG(dims.props.box)
      let hoverContainerEl = undefined
      const onHoverFn = this.settings.onHoverFn
      // lines hover
      if (onHoverFn || this.settings.line?.hover) {
        let hoverMarker = undefined
        if (this.settings.line?.hover) {
          hoverMarker= new HoverMarkerLines(this.settings.line.hover, dims.props)
          hoverContainerEl = hoverMarker.getSVG()
        }
        const pointsIdx = this.getPointsIndex(dims.props, this.settings.line != null, this.settings.bars != null)
        view.addEventListener('mouseover', e => this.hoverAction(e, view, dims.props, pointsIdx, onHoverFn, hoverMarker))
        view.addEventListener('mousemove', e => this.hoverAction(e, view, dims.props, pointsIdx, onHoverFn, hoverMarker))
        view.addEventListener('mouseout', () => {
          hoverMarker && hoverMarker.hide()
        })
      }
      // bars hover
      if (onHoverFn || this.settings.bars?.hover) {
        let hoverMarker = undefined
        if (this.settings.bars?.hover) {
          hoverMarker= new HoverMarkerBars(this.settings.bars.hover, dims.props)
          hoverContainerEl = hoverMarker.getSVG()
        }
        const pointsIdx = this.getPointsIndex(dims.props, this.settings.line != null, this.settings.bars != null)
        view.addEventListener('mouseover', e => this.hoverAction(e, view, dims.props, pointsIdx, onHoverFn, hoverMarker))
        view.addEventListener('mousemove', e => this.hoverAction(e, view, dims.props, pointsIdx, onHoverFn, hoverMarker))
        view.addEventListener('mouseout', () => {
          hoverMarker && hoverMarker.hide()
        })
      }
      // bars, first as these need to be behind lines and dots
      if (this.settings.bars) {
        const l = new Bars(this.points, dims.props, this.settings.bars, this.logger)
        const barsSVG = l.draw()
        if (barsSVG) {
          view.appendChild(barsSVG)
        }
      }
      if (this.settings.line) {
        const l = new Lines(this.points, dims.props, this.settings.line, this.logger)
        const linesSVG = l.draw(this.settings.bars != null)
        if (linesSVG) {
          view.appendChild(linesSVG)
        }
      }
      // hover on top
      if (hoverContainerEl) {
        view.appendChild(hoverContainerEl)
      }
      this.el.appendChild(view)
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }
      this.setError(e)
    }
    return this.el
  }

  checkAndReRender() {
    // re-render if necessary
    if (this.el.hasChildNodes()) {
      this.render()
    }
  }

  setSettings(settings: ISparkLinesProps | string): void {
    let settingsObj
    try {
      settingsObj = typeof settings === 'string' ? JSON.parse(settings) : settings
    } catch (e) {
      this.setError(new Error('Supplied sparkline settings are not a valid JSON object'))
    }
    try {
      if (!this.settings) {
        this.settings = new Settings(settingsObj)
      } else {
        this.settings.update(settingsObj)
      }
      this.checkAndReRender()
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }
      this.setError(e)
    }
  }

  setValues(values: string | IValues): void {
    try {
      this.validateAndSetValues(values)
      this.checkAndReRender()
    } catch (e) {
      this.setError(new Error('Supplied sparkline values are not a valid JSON object'))
    }
  }

  constructor(
      id?: string,
      logSettings?: {
        noLog?: boolean,
        logger?: ILogger
      }
  ) {
    if (id) {
      this.id = id
      this.el.setAttribute('id', this.id)
    }
    this.errorsUseConsole = !(logSettings?.noLog ?? false)
    if (this.errorsUseConsole) {
        this.logger = new Logger({
            sparkLineId: id
          },
        logSettings?.logger)
    } else {
      this.logger = new Logger(undefined, loggerStub)
    }
  }
}

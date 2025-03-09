import {
    IBarsProps,
    IBarsSettings,
    IColorSettings, IColorProps,
    IDotsSettings, ILineProps,
    ILineSettings,
    ISparkLinesSettings, ISparkLinesProps
} from './ISparkLinesSettings'
import { anyValueToNumber } from '../shared.ts'

const DEFAULT_COLOR = 'currentColor'
const DEFAULT_WIDTH = 200
const DEFAULT_HEIGHT = 100
const DEFAULT_STROKE = 1.67
const DEFAULT_DOTSIZE = 3.67

export class Settings {
    private settings!: ISparkLinesSettings

    private validateProperty(v: any, label: string, required: boolean, type: 'number' | 'string' | 'boolean', props?: {
        min?: number
        max?: number
    }): void {
        if (v == null && required) {
            throw new Error(`value given for settings.${label} is required`)
        }
        switch (type) {
            case 'number':
                if (typeof v === 'string' && v.trim().length === 0 && required) {
                    throw new Error(`value given for settings.$ {label} may not be an empty string`)
                }
                const n = anyValueToNumber(v, `settings.${label}`)
                if (n != null && props?.min != null && n < props.min) {
                    throw new Error(`value given for settings.${label} must be >= ${props.min}`)
                }
                if (n != null && props?.max != null && n > props.max) {
                    throw new Error(`value given for settings.${label} must be <= ${props.max}`)
                }
                break
            case 'string':
                if (typeof v !== 'string') {
                    throw new Error(`value given for settings.${label} must be a string`)
                }
                break
            case 'boolean':
                if (typeof v !== 'boolean') {
                    throw new Error(`value given for settings.${label} must be a boolean`)
                }
        }
    }

    private validateColorSettings(which: string, v: IColorSettings) {
        if (v.opacity) {
            this.validateProperty(v.opacity, `${which}.opacity`, true, 'number', {
                min: 0.01,
                max: 1
            })
        }
        // lets not validate color hex/rgb/etc strings for now
        // garbage here will just be ignored by the browser (no errors)
        return v
    }

    private validateDots(v: IDotsSettings) {
        if (!(v.stroke != null && v.strokeWidth != null || (v.stroke == null && v.strokeWidth == null))) {
            throw new Error('Dots stroke and stroke width must either be both filled or both empty')
        }
        this.validateProperty(v.strokeWidth, 'dots stroke width', false, 'number', {
            // just may not be negative or zero
            min: 0.001
        })
        if (v.stroke) {
            this.validateColorSettings('line.dots.stroke', v.stroke)
        }
        this.validateProperty(v.size, 'dots size', true, 'number', {
            // just may not be negative or zero
            min: 0.001
        })
        this.validateColorSettings('dots', v.fill)
    }

    private validateLine(v: ILineSettings) {
        if (!(v.stroke != null && v.strokeWidth != null || (v.stroke == null && v.strokeWidth == null))) {
            throw new Error('Line stroke and stroke width must either be both filled or both empty')
        }
        this.validateProperty(v.strokeWidth, 'stroke width', true, 'number', {
            // just may not be negative or zero
            min: 0.001
        })
        this.validateColorSettings('line.stroke', v.stroke)
        if (v.dots) {
            this.validateDots(v.dots)
        }
        if (v.fill) {
            this.validateColorSettings('line.fill', v.fill)
        }
        if (v.hover) {
            if (v.hover.dot) {
                this.validateDots(v.hover.dot)
            }
        }
    }

    private validateBars(v: IBarsSettings) {
        this.validateProperty(v.marginPercentage, 'bars', false, 'number', {
            min: 0,
            max: 100
        })
        this.validateColorSettings('bars.fill', v.fill)
        if (v.hover) {
            if (v.hover.fill) {
                this.validateColorSettings('bars.hover.fill', v.hover.fill)
            }
        }
    }

    private validateAndSet(settingsObj: ISparkLinesSettings) {
        if (typeof settingsObj !== 'object') {
            throw new Error('Settings must be an Object')
        }
        if (!settingsObj.line && !settingsObj.bars) {
            throw new Error('Settings must contains at least line or bars')
        }
        if (settingsObj.line && settingsObj.bars && settingsObj.bars.isWinLoss) {
            throw new Error('Win/loss chart may not be combined with lines')
        }
        this.validateProperty(settingsObj.width, 'width', true, 'number', {
            min: 1,
            max: 8092
        })
        this.validateProperty(settingsObj.height, 'height', true, 'number', {
            min: 1,
            max: 8092
        })
        if (settingsObj.showUndefinedValuesAs !== 'missing' && settingsObj.showUndefinedValuesAs !== 'unchanged') {
            throw new Error(`value given for settings.showMissingValuesAs must be none or use-previous`)
        }
        if (settingsObj.onHoverFn && typeof settingsObj.onHoverFn !== 'function') {
            throw new Error(`value given for settings.onHoverFn must be a function`)
        }
        if (settingsObj.line) {
            this.validateLine(settingsObj.line)
        }
        if (settingsObj.bars) {
            this.validateBars(settingsObj.bars)
        }
        this.settings = settingsObj
    }

    get width() {
        return this.settings.width
    }

    get height() {
        return this.settings.height
    }

    get showUndefinedValuesAs() {
        return this.settings.showUndefinedValuesAs
    }

    get dotSize() {
        return this.settings.line?.dots?.size
    }

    get line() {
        return this.settings.line
    }

    get bars() {
        return this.settings.bars
    }

    get onHoverFn() {
        return this.settings.onHoverFn
    }

    getFullLineSettings(settings?: ILineProps): ILineSettings {
        return {
            strokeWidth: settings?.strokeWidth ?? DEFAULT_STROKE,
            stroke: {
                color: settings?.stroke?.color ?? DEFAULT_COLOR,
                colorForNegativeValues: settings?.stroke?.colorForNegativeValues,
                colorForPositiveValues: settings?.stroke?.colorForPositiveValues,
                opacity: settings?.stroke?.opacity
            },
            fill: settings?.fill ? {
                color: settings.fill.color ?? DEFAULT_COLOR,
                colorForNegativeValues: settings.fill.colorForNegativeValues,
                colorForPositiveValues: settings.fill.colorForPositiveValues,
                opacity: settings?.fill.opacity
            } : undefined,
            dots: settings?.dots ? {
                stroke: settings.dots.stroke ?? (settings.dots.strokeWidth != null ? {
                                                                                color: DEFAULT_COLOR
                                                                            } : undefined),
                strokeWidth: settings.dots.strokeWidth ?? (settings.dots.stroke != null ? DEFAULT_STROKE : undefined),
                size: settings.dots.size ?? DEFAULT_DOTSIZE,
                fill: {
                    color: settings?.dots?.fill?.color ?? DEFAULT_COLOR,
                    colorForNegativeValues: settings?.dots?.fill?.colorForNegativeValues,
                    colorForPositiveValues: settings?.dots?.fill?.colorForPositiveValues,
                    opacity: settings?.dots?.fill?.opacity
                }
            } : undefined,
            hover: settings?.hover ? {
                dot: settings?.hover?.dot ? {
                    stroke: settings.hover.dot.stroke,
                    strokeWidth: settings.hover.dot.strokeWidth,
                    size: settings.hover.dot.size ?? DEFAULT_DOTSIZE,
                    fill: {
                        color: settings.hover.dot.fill?.color ?? DEFAULT_COLOR,
                        colorForNegativeValues: settings.hover.dot.fill?.colorForNegativeValues,
                        colorForPositiveValues: settings.hover.dot.fill?.colorForPositiveValues,
                        opacity: settings.hover.dot.fill?.opacity
                    }
                } : undefined,
            } : undefined,
        }
    }

    getFullBarsSettings(settings?: IBarsProps): IBarsSettings {
        return {
            isWinLoss: settings?.isWinLoss ?? false,
            marginPercentage: settings?.marginPercentage,
            fill: {
                color: settings?.fill?.color ?? DEFAULT_COLOR,
                colorForNegativeValues: settings?.fill?.colorForNegativeValues,
                colorForPositiveValues: settings?.fill?.colorForPositiveValues,
                opacity: settings?.fill?.opacity
            },
            hover: settings?.hover ? {
                fill: settings?.hover?.fill ? {
                    color: settings.hover.fill?.color ?? DEFAULT_COLOR,
                    colorForNegativeValues: settings.hover.fill?.colorForNegativeValues,
                    colorForPositiveValues: settings.hover.fill?.colorForPositiveValues,
                    opacity: settings.hover.fill?.opacity
                } : undefined,
            } : undefined
        }
    }

    cloneSettings(): ISparkLinesSettings {
        // deep clone, for now just do it the simple way, because this is the only place we need it and otherwise would need a library which increases build size
        return JSON.parse(JSON.stringify(this.settings))
    }

    updatedColor(current: IColorProps, updated: IColorProps): IColorSettings {
        return {
            color: updated.colorForNegativeValues ?? current.colorForNegativeValues ?? DEFAULT_COLOR,
            opacity: updated.opacity ?? current.opacity,
            colorForNegativeValues: updated.colorForNegativeValues ?? current.colorForNegativeValues,
            colorForPositiveValues: updated.colorForPositiveValues ?? current.colorForPositiveValues
        }
    }

    update(v: ISparkLinesProps) {
        if (!this.settings) {
            throw new Error('Settings must be defined when updating settings')
        }
        const settings = this.cloneSettings()
        // this will only support style changes to current settings, so not e.g. adding or removing dots
        // or changing from a line to bars sparkline, which are not likely use cases
        if (v.width != null) {
            settings.width = v.width
        }
        if (v.height != null) {
            settings.height = v.height
        }
        if (v.onHoverFn != null) {
            settings.onHoverFn = v.onHoverFn
        }
        if (v.showUndefinedValuesAs != null) {
            settings.showUndefinedValuesAs = v.showUndefinedValuesAs
        }
        if (v.line != null && settings.line != null) {
            if (v.line.strokeWidth != null) {
                settings.line.strokeWidth = v.line.strokeWidth
            }
            if (v.line.stroke != null && settings.line.stroke != null) {
                settings.line.stroke = this.updatedColor(settings.line.stroke, v.line.stroke)
            }
            if (v.line.fill != null && settings.line.fill != null) {
                settings.line.fill = this.updatedColor(settings.line.fill, v.line.fill)
            }
            if (v.line.dots != null && settings.line.dots != null) {
                if (v.line.dots.stroke != null) {
                    settings.line.dots.stroke = v.line.dots.stroke
                }
                if (v.line.dots.strokeWidth != null) {
                    settings.line.dots.strokeWidth = v.line.dots.strokeWidth
                }
                if (v.line.dots.size != null) {
                    settings.line.dots.size = v.line.dots.size
                }
                if (v.line.dots.fill != null) {
                    settings.line.dots.fill = this.updatedColor(settings.line.dots.fill, v.line.dots.fill)
                }
            }
            if (v.line.hover != null && settings.line.hover != null) {
                if (v.line.hover.dot != null) {
                    if (v.line.hover.dot.stroke != null && settings.line.hover.dot?.stroke != null) {
                        settings.line.hover.dot.stroke = v.line.hover.dot.stroke
                    }
                    if (v.line.hover.dot.strokeWidth != null && settings.line.hover.dot?.strokeWidth != null) {
                        settings.line.hover.dot.strokeWidth = v.line.hover.dot.strokeWidth
                    }
                    if (v.line.hover.dot.size != null && settings.line.hover.dot?.size != null) {
                        settings.line.hover.dot.size = v.line.hover.dot.size
                    }
                    if (v.line.hover.dot.fill != null && settings.line.hover.dot?.fill != null) {
                        settings.line.hover.dot.fill = this.updatedColor(settings.line.hover.dot.fill, v.line.hover.dot.fill)
                    }
                }
            }
        }
        if (v.bars != null && settings.bars != null) {
            if (v.bars.isWinLoss != null && settings.bars.isWinLoss != null) {
                settings.bars.isWinLoss = v.bars.isWinLoss
            }
            if (v.bars.fill != null && settings.bars.fill != null) {
                settings.bars.fill = this.updatedColor(settings.bars.fill, v.bars.fill)
            }
            if (v.bars.hover != null && settings.bars.hover != null) {
                if (v.bars.hover.fill != null && settings.bars.hover.fill != null) {
                    settings.bars.hover.fill = this.updatedColor(settings.bars.hover.fill, v.bars.hover.fill)
                }
            }
        }
        this.validateAndSet(settings)
    }

    constructor(v?: ISparkLinesProps) {
        const values = v ?? {}
        const settings: ISparkLinesSettings = {
            width: values.width ?? DEFAULT_WIDTH,
            height: values.height ?? DEFAULT_HEIGHT,
            showUndefinedValuesAs: values.showUndefinedValuesAs ?? 'missing',
            onHoverFn: values.onHoverFn
        }
        // if neither bars nor lines specified use the default lines
        if (values.line || (!values.line && !values.bars)) {
            settings.line = this.getFullLineSettings(values?.line)
        }
        if (values.bars) {
            settings.bars = this.getFullBarsSettings(values?.bars)
        }
        this.validateAndSet(settings)
    }
}

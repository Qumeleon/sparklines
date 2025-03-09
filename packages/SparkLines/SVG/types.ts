import {IPoint} from '../types.ts'

interface IBaseProps {
  value?: number
  xLabel?: string
  fill: string
  fillOpacity?: number
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
}

export interface ICoordinates {
  x: number
  y: number
}

export interface IDimension {
  width: number
  height: number
}

export interface IBoxProps extends ICoordinates, IDimension {}

export interface ITransformProps {
  translate?: ICoordinates
  scale?: ICoordinates
}

export interface ICircleProps extends IBaseProps {
  centerX: number
  centerY: number
  radius: number
}

export interface IRectangleProps extends IBoxProps, IBaseProps {}

export interface IPathProps extends IBaseProps {
  points: IPoint[]
}

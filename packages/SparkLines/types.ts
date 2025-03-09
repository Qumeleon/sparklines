export interface IPoint {
    x: number
    xLabel?: string
    y?: number
    value?: number
}

export interface IMarkerIndex {
    xFrom: number
    xTo: number
    xCoordMarker: number
}

export interface IIndexedPoint extends IPoint {
    markerIndex: IMarkerIndex
}

const SOURCE = '@qumeleon/sparklines'

interface ILoggerContext {
    source?: string
    sparkLineId?: string
}

export interface ILogger {
    logMessage: (context: ILoggerContext, ...data: any[]) => void,
    logWarning: (context: ILoggerContext, ...data: any[]) => void,
    logError: (context: ILoggerContext, ...data: any[]) => void
}

function formatContext(context: ILoggerContext) {
    return `${context.source} (id ${context.sparkLineId ?? 'unknown'}):`
}

const defaultLogger: ILogger = {
    logMessage: (context: ILoggerContext, ...data: any[]) => console.log(formatContext(context), ...data),
    logWarning: (context: ILoggerContext, ...data: any[]) => console.warn(formatContext(context), ...data),
    logError: (context: ILoggerContext, ...data: any[]) => console.error(formatContext(context), ...data)
}

export const loggerStub: ILogger = {
    logMessage: () => {},
    logWarning: () => {},
    logError: () => {}
}

export class Logger {
    private readonly context: ILoggerContext

    private readonly logFn: ILogger

    log(...data: any[]) {
        this.logFn.logMessage(this.context, ...data)
    }

    warn(...data: any[]) {
        this.logFn.logWarning(this.context, ...data)
    }

    error(...data: any[]) {
        this.logFn.logError(this.context, ...data)
    }

    constructor(context?: ILoggerContext, logFn?: Partial<ILogger>) {
        this.context = {
            source: context?.source ?? SOURCE,
            sparkLineId: context?.sparkLineId
        }
        this.logFn = {
            logMessage: logFn?.logMessage ?? defaultLogger.logMessage,
            logError: logFn?.logError ?? defaultLogger.logError,
            logWarning: logFn?.logWarning ?? defaultLogger.logWarning
        }
    }
}
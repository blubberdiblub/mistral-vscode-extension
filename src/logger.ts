import { window, LogLevel } from 'vscode';

import type { Logger, LogTarget, MessageSeverity, OutputSeverity } from './types';
import { MESSAGE_SEVERITY, OUTPUT_SEVERITY } from './constants';

//import format from 'string-format';


type _LogTarget = LogTarget | string;

export class VSCodeLogger implements Logger
{
    private _targetEntries: Record<number, {target: LogTarget, severity: number}> = {};
    private _minimumSeverity: number;

    constructor(severity?: OutputSeverity | number, targets: _LogTarget[] = [console])
    {
        const severityNumber = VSCodeLogger._severityToNumber(severity);
        this._minimumSeverity = severityNumber;

        for (const [i, target] of targets.entries())
        {
            this._targetEntries[i] = {
                target: VSCodeLogger._convertToLogTarget(target),
                severity: severityNumber,
            };
        }
    }

    private static _convertToLogTarget(target: _LogTarget) : LogTarget
    {
        if (typeof target !== 'string')
            return target;

        if (!target)
            return null;

        return window.createOutputChannel(target, { log: true });
    }

    private static _severityToNumber(severity: OutputSeverity | number | null | undefined): number
    {
        if (typeof severity === 'string')
            return OUTPUT_SEVERITY[severity];

        return severity || OUTPUT_SEVERITY.warn;
    }

    private static _severityToLogLevel(severity: number): LogLevel
    {
        if (severity === OUTPUT_SEVERITY.none) return LogLevel.Off;
        if (severity < OUTPUT_SEVERITY.debug)  return LogLevel.Trace;
        if (severity < OUTPUT_SEVERITY.info)   return LogLevel.Debug;
        if (severity < OUTPUT_SEVERITY.warn)   return LogLevel.Info;
        if (severity < OUTPUT_SEVERITY.error)  return LogLevel.Warning;
        /* ========== otherwise ========== */  return LogLevel.Error;
    }

    trace(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.trace, message, ...args);
    }

    debug(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.debug, message, ...args);
    }

    info(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.info, message, ...args);
    }

    notice(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.notice, message, ...args);
    }

    warn(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.warn, message, ...args);
    }

    error(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.error, message, ...args);
    }

    critical(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.critical, message, ...args);
    }

    fatal(message: string, ...args: any[]): void
    {
        this._log(MESSAGE_SEVERITY.fatal, message, ...args);
    }

    log(severity: MessageSeverity | number, message: string, ...args: any[]): void
    {
        const numericSeverity = typeof severity === 'number' ? severity : MESSAGE_SEVERITY[severity];
        this._log(numericSeverity, message, ...args);
    }

    private _log(severity: number, message: string, ...args: any[]): void
    {
        if (severity < this._minimumSeverity)
            return;

        for (const entry of Object.values(this._targetEntries))
        {
            if (!entry.target || severity < entry.severity)
                continue;

            const logLevel = VSCodeLogger._severityToLogLevel(severity);

            if (entry.target instanceof console.Console)
            {
                switch (logLevel)
                {
                    case LogLevel.Off:
                        break;
                    case LogLevel.Trace:
                        entry.target.trace(message, ...args);
                        break;
                    case LogLevel.Debug:
                        entry.target.debug(message, ...args);
                        break;
                    case LogLevel.Info:
                        entry.target.info(message, ...args);
                        break;
                    case LogLevel.Warning:
                        entry.target.warn(message, ...args);
                        break;
                    case LogLevel.Error:
                        entry.target.error(message, ...args);
                        break;
                }

                continue;
            }

            // otherwise entry.target has interface vscode.LogOutputChannel
            switch (logLevel)
            {
                case LogLevel.Off:
                    break;
                case LogLevel.Trace:
                    entry.target.trace(message, ...args);
                    break;
                case LogLevel.Debug:
                    entry.target.debug(message, ...args);
                    break;
                case LogLevel.Info:
                    entry.target.info(message, ...args);
                    break;
                case LogLevel.Warning:
                    entry.target.warn(message, ...args);
                    break;
                case LogLevel.Error:
                    entry.target.error(message, ...args);
                    break;
            }
        }
    }
}

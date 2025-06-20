import { NextRequest } from "next/server";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
    requestId?: string;
    userId?: string;
    userAgent?: string;
    ip?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
    query?: string;
    queryParams?: Record<string, unknown>;
    error?: Error;
    operation?: string;
    bucket?: string;
    key?: string;
    size?: number;
    [key: string]: unknown;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context: LogContext;
    category:
        | "request"
        | "response"
        | "database"
        | "storage"
        | "auth"
        | "error"
        | "general";
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === "development";
    private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

    private shouldLog(level: LogLevel): boolean {
        const levels: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        return levels[level] >= levels[this.logLevel];
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        context: LogContext
    ): string {
        const timestamp = new Date().toISOString();
        const requestId = context.requestId ? `[${context.requestId}]` : "";
        const userId = context.userId ? `[user:${context.userId}]` : "";

        let logMessage = `[${timestamp}] ${level.toUpperCase()} ${requestId}${userId} ${message}`;

        if (this.isDevelopment) {
            // Pretty print for development
            if (context.method && context.url) {
                logMessage += `\n  📋 ${context.method} ${context.url}`;
            }
            if (context.statusCode) {
                const statusIcon = context.statusCode >= 400 ? "❌" : "✅";
                logMessage += `\n  ${statusIcon} Status: ${context.statusCode}`;
            }
            if (context.duration) {
                logMessage += `\n  ⏱️  Duration: ${context.duration}ms`;
            }
            if (context.query) {
                logMessage += `\n  🗄️  Query: ${context.query}`;
            }
            if (context.operation) {
                logMessage += `\n  🔧 Operation: ${context.operation}`;
            }
            if (context.bucket && context.key) {
                logMessage += `\n  📦 Storage: ${context.bucket}/${context.key}`;
            }
            if (context.error) {
                logMessage += `\n  💥 Error: ${context.error.message}`;
                if (context.error.stack) {
                    logMessage += `\n  📚 Stack: ${context.error.stack}`;
                }
            }
        } else {
            // JSON format for production
            const logEntry: LogEntry = {
                timestamp,
                level,
                message,
                context,
                category: this.determineCategory(context),
            };
            return JSON.stringify(logEntry);
        }

        return logMessage;
    }

    private determineCategory(context: LogContext): LogEntry["category"] {
        if (context.method && context.url) return "request";
        if (context.statusCode) return "response";
        if (context.query) return "database";
        if (context.bucket || context.key) return "storage";
        if (context.error) return "error";
        return "general";
    }

    private log(level: LogLevel, message: string, context: LogContext = {}) {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message, context);

        switch (level) {
            case "debug":
                console.debug(formattedMessage);
                break;
            case "info":
                console.info(formattedMessage);
                break;
            case "warn":
                console.warn(formattedMessage);
                break;
            case "error":
                console.error(formattedMessage);
                break;
        }
    }

    debug(message: string, context: LogContext = {}) {
        this.log("debug", message, context);
    }

    info(message: string, context: LogContext = {}) {
        this.log("info", message, context);
    }

    warn(message: string, context: LogContext = {}) {
        this.log("warn", message, context);
    }

    error(message: string, context: LogContext = {}) {
        this.log("error", message, context);
    }

    // Request logging helpers
    logRequest(req: NextRequest, context: LogContext = {}) {
        const requestId = this.generateRequestId();
        const baseContext: LogContext = {
            requestId,
            method: req.method,
            url: req.url,
            userAgent: req.headers.get("user-agent") || undefined,
            ip:
                req.headers.get("x-forwarded-for") ||
                req.headers.get("x-real-ip") ||
                undefined,
            ...context,
        };

        this.info("Incoming request", baseContext);
        return requestId;
    }

    logResponse(
        requestId: string,
        statusCode: number,
        duration: number,
        context: LogContext = {}
    ) {
        this.info("Response sent", {
            requestId,
            statusCode,
            duration,
            ...context,
        });
    }
    // Database logging helpers
    logDatabaseQuery(
        query: string,
        params: unknown[] = [],
        context: LogContext = {}
    ) {
        this.debug("Database query executed", {
            query: query.replace(/\s+/g, " ").trim(),
            queryParams: params.length > 0 ? { params } : undefined,
            ...context,
        });
    }

    logDatabaseError(query: string, error: Error, context: LogContext = {}) {
        this.error("Database query failed", {
            query: query.replace(/\s+/g, " ").trim(),
            error,
            ...context,
        });
    }

    // Storage logging helpers
    logStorageOperation(
        operation: string,
        bucket: string,
        key: string,
        context: LogContext = {}
    ) {
        this.info("Storage operation", {
            operation,
            bucket,
            key,
            ...context,
        });
    }

    logStorageError(
        operation: string,
        bucket: string,
        key: string,
        error: Error,
        context: LogContext = {}
    ) {
        this.error("Storage operation failed", {
            operation,
            bucket,
            key,
            error,
            ...context,
        });
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}

export const logger = new Logger();
export default logger;

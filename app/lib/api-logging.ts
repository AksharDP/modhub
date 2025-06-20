import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export type ApiHandler = (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse;

export interface ApiRouteConfig {
  requireAuth?: boolean;
  allowedMethods?: string[];
  rateLimitKey?: string;
}

export function withApiLogging(handler: ApiHandler, config: ApiRouteConfig = {}) {
  return async function loggedHandler(req: NextRequest, context?: { params?: Record<string, string> }) {
    const startTime = Date.now();
    const requestId = logger.logRequest(req, {
      handler: handler.name || 'anonymous',
      allowedMethods: config.allowedMethods,
      requireAuth: config.requireAuth
    });

    try {
      // Check if method is allowed
      if (config.allowedMethods && !config.allowedMethods.includes(req.method)) {
        const response = NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        );
          const duration = Date.now() - startTime;
        logger.logResponse(requestId, 405, duration, {
          message: 'Method not allowed',
          allowedMethods: config.allowedMethods
        });
        
        return response;
      }

      // Log request body for non-GET requests
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const body = await req.clone().text();
          if (body) {
            logger.debug("Request body received", {
              requestId,
              method: req.method,
              bodySize: body.length,
              contentType: req.headers.get('content-type')
            });
          }
        } catch (error) {
          logger.warn("Failed to read request body for logging", {
            requestId,
            error: error as Error
          });
        }
      }

      // Execute the handler
      const response = await handler(req, context);
      
      // Log successful response
      const duration = Date.now() - startTime;
      logger.logResponse(requestId, response.status, duration, {
        success: true,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorObj = error as Error;
      
      logger.error("API route error", {
        requestId,
        error: errorObj,
        duration,
        method: req.method,
        url: req.url
      });

      // Return error response
      const response = NextResponse.json(
        { 
          error: 'Internal server error',
          requestId: requestId 
        },
        { 
          status: 500,
          headers: {
            'X-Request-ID': requestId
          }
        }
      );
        logger.logResponse(requestId, 500, duration, {
        message: errorObj.message
      });
      
      return response;
    }
  };
}

// Specific method wrappers
export function withGetLogging(handler: ApiHandler) {
  return withApiLogging(handler, { allowedMethods: ['GET'] });
}

export function withPostLogging(handler: ApiHandler) {
  return withApiLogging(handler, { allowedMethods: ['POST'] });
}

export function withPutLogging(handler: ApiHandler) {
  return withApiLogging(handler, { allowedMethods: ['PUT'] });
}

export function withDeleteLogging(handler: ApiHandler) {
  return withApiLogging(handler, { allowedMethods: ['DELETE'] });
}

export function withPatchLogging(handler: ApiHandler) {
  return withApiLogging(handler, { allowedMethods: ['PATCH'] });
}

// Utility function to log API responses from within handlers
export function logApiResponse(message: string, data: unknown, requestId?: string) {
  logger.info(message, {
    requestId,
    responseData: typeof data === 'object' ? JSON.stringify(data) : String(data)
  });
}

// Utility function to log API errors from within handlers
export function logApiError(message: string, error: Error, requestId?: string) {
  logger.error(message, {
    requestId,
    error
  });
}

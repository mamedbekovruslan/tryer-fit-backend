import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { getAllowedOrigins } from '../config/security-config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_COOKIE_PATTERN = /(?:^|;\s*)token=/;

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }

    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const cookieHeader = req.headers.cookie ?? '';
    if (!AUTH_COOKIE_PATTERN.test(cookieHeader)) {
      next();
      return;
    }

    const source = req.headers.origin ?? req.headers.referer;
    if (!source) {
      throw new ForbiddenException('CSRF protection: missing origin');
    }

    const requestOrigin = getOrigin(source);
    const allowedOrigins = getAllowedOrigins();

    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      throw new ForbiddenException('CSRF protection: origin not allowed');
    }

    next();
  }
}

function getOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../../../../db/db.module";
import * as schema from "../../../../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { and, eq, gt } from "drizzle-orm";
import type { SessionTokenPayload } from "../../auth/auth.service";
import { SESSION_COOKIE_NAME } from "../../../constants";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      request.user = undefined;
      return true; // allow unauthenticated users
    }

    try {
      const secret = this.configService.get<string>("refreshToken.secret")!;
      const decoded = jwt.verify(token, secret) as SessionTokenPayload;

      const session = await this.db.query.sessions.findFirst({
        where: and(
          eq(schema.sessions.id, decoded.sid),
          eq(schema.sessions.userId, decoded.sub),
          eq(schema.sessions.isRevoked, false),
          gt(schema.sessions.expiresAt, new Date()),
        ),
        columns: { id: true, userId: true },
      });

      if (!session) {
        request.user = undefined;
        return true;
      }

      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.id, decoded.sub),
        columns: {
          id: true,
          role: true,
          email: true,
        },
      });

      request.user = user
        ? {
            id: user.id,
            sessionId: session.id,
            role: user.role,
            email: user.email,
          }
        : undefined;
    } catch {
      request.user = undefined; // invalid token, treat as unauthenticated
    }

    return true; // Always allow
  }
}

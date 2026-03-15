import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
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

export interface AuthenticatedRequestUser {
  id: string;
  sessionId: string;
  role: "user" | "admin" | "moderator";
  email: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (!token)
      throw new UnauthorizedException("Authentication token required");

    // Step 1: verify JWT signature and expiry
    let payload: SessionTokenPayload;
    try {
      payload = jwt.verify(
        token,
        this.configService.get<string>("refreshToken.secret")!,
      ) as SessionTokenPayload;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    // Step 2: check session exists, belongs to user, and is active
    const session = await this.db.query.sessions.findFirst({
      where: and(
        eq(schema.sessions.id, payload.sid),
        eq(schema.sessions.userId, payload.sub),
        eq(schema.sessions.isRevoked, false),
        gt(schema.sessions.expiresAt, new Date()),
      ),
      columns: { id: true, userId: true },
    });

    if (!session)
      throw new UnauthorizedException("Session not found or revoked");

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, payload.sub),
      columns: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found for this session");
    }

    request["user"] = {
      id: user.id,
      sessionId: session.id,
      role: user.role,
      email: user.email,
    } satisfies AuthenticatedRequestUser;

    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

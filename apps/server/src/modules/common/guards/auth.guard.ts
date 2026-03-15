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
import { DRIZZLE } from "db/db.module";
import * as schema from "../../../../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js/driver";
import { and, eq } from "drizzle-orm";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.refreshToken;

    if (!token)
      throw new UnauthorizedException("Authentication token required");

    // Step 1: verify JWT signature and expiry
    let payload: { sub: string; sid: string };
    try {
      payload = jwt.verify(
        token,
        this.configService.get<string>("sessionToken.secret")!,
      ) as { sub: string; sid: string };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    // Step 2: check session exists and is not revoked
    const session = await this.db.query.sessions.findFirst({
      where: and(
        eq(schema.sessions.id, payload.sid),
        eq(schema.sessions.isRevoked, false),
      ),
    });

    if (!session)
      throw new UnauthorizedException("Session not found or revoked");

    request["user"] = { id: payload.sub, sessionId: payload.sid };
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

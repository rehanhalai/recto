import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService?.get<string>("mail.host")!;
    const port = this.configService?.get<number>("mail.port")!;
    const user = this.configService?.get<string>("mail.user")!;
    const pass = this.configService?.get<string>("mail.pass")!;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  private resolveTemplatePath(templateName: string): string {
    const templateFileName = `${templateName}.hbs`;
    const candidatePaths = [
      path.join(__dirname, "templates", templateFileName),
      // Nest assets can be emitted to dist/modules while JS files are in dist/src/modules.
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "src",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "apps",
        "server",
        "src",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "dist",
        "src",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "dist",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "apps",
        "server",
        "dist",
        "src",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
      path.join(
        process.cwd(),
        "apps",
        "server",
        "dist",
        "modules",
        "mail",
        "templates",
        templateFileName,
      ),
    ];

    const resolvedPath = candidatePaths.find((candidatePath) =>
      fs.existsSync(candidatePath),
    );

    if (!resolvedPath) {
      throw new Error(
        `Email template '${templateName}' not found. Checked: ${candidatePaths.join(", ")}`,
      );
    }

    return resolvedPath;
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, string>,
  ) {
    const templatePath = this.resolveTemplatePath(templateName);
    let template = fs.readFileSync(templatePath, "utf8");

    for (const key in data) {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      template = template.replace(placeholder, data[key]);
    }

    return template;
  }

  private resolveLogoAssetPath(): string {
    try {
      return require.resolve("@recto/assets/logos/recto-logo-light.webp");
    } catch {
      const candidatePaths = [
        path.join(
          process.cwd(),
          "packages",
          "assets",
          "src",
          "logos",
          "recto-logo-light.webp",
        ),
        path.join(
          process.cwd(),
          "..",
          "packages",
          "assets",
          "src",
          "logos",
          "recto-logo-light.webp",
        ),
        path.join(
          process.cwd(),
          "..",
          "..",
          "packages",
          "assets",
          "src",
          "logos",
          "recto-logo-light.webp",
        ),
      ];

      const existingPath = candidatePaths.find((candidatePath) =>
        fs.existsSync(candidatePath),
      );

      return existingPath ?? candidatePaths[0];
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService?.get<string>("mail.from")!;
    const logoPath = this.resolveLogoAssetPath();

    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "recto-logo-light.webp",
          path: logoPath,
          cid: "rectoLogoLight",
        },
      ],
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const html = await this.renderTemplate("otp", { otp });
    await this.sendMail(to, "Your Verification Code", html);
  }

  async sendWelcomeEmail(to: string, userName: string) {
    const clientUrl =
      this.configService.get<string>("clientUrl") || "http://localhost:3000";
    const html = await this.renderTemplate("welcome", { userName, clientUrl });
    await this.sendMail(to, "Welcome to Recto!", html);
  }

  async sendResetPasswordEmail(to: string, resetLink: string) {
    const html = await this.renderTemplate("password-reset", { resetLink });
    await this.sendMail(to, "Reset Your Password", html);
  }
}

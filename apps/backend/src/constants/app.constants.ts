import { appConfig } from "@hype-stack/enums";

export const APP_NAME = appConfig.name;

export const EMAIL_FROM = `${APP_NAME} <noreply@${process.env.RESEND_FROM_DOMAIN || "resend.dev"}>`;

import "server-only";

export const ADMIN_USERNAME = "admin";
export const ADMIN_LOGIN_EMAIL = process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() || "pimpudev@protonmail.com";

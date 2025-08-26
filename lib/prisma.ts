import { PrismaClient } from "./generated/prisma";

declare global {
  // Extend the globalThis type to include prisma
  var prisma: PrismaClient | undefined;
}

export const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

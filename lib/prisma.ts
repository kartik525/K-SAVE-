import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

// Use DATABASE_URL (pooled port) for runtime
export const db =
    globalThis.prisma ??
    new PrismaClient();

// Prevent multiple instances in dev
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pkg from 'pg';

// const { Pool } = pkg;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
// const adapter = new PrismaPg(pool);

// const prisma = new PrismaClient({ adapter });   

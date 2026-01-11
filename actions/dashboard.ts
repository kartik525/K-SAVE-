"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import { serializeAccount } from "../lib/utils"

const serializeAccount = (account: any) => {
    return {
        ...account,
        balance: account.balance.toNumber(),
    };
};

const serializeAmount = (obj: any) => ({ ...obj, amount: obj.amount.toNumber() })



export async function createAccount(data: any) {
    try {
        const { userId } = await auth()
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found in database");
        }
        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance amount");
        }

        const existingAccount = await db.account.findMany({
            where: {
                userId: user.id,
                name: data.name
            }
        });

        const shouldBeDefault = existingAccount.length === 0 ? true : data.isDefault;
        if (shouldBeDefault) {
            await db.account.updateMany(
                {
                    where: { userId: user.id, isDefault: true },
                    data: { isDefault: false }
                }
            )
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
                userId: user.id
            }
        })
        const serializedAccount = serializeAccount(account);
        revalidatePath("/dashboard");

        return { success: true, data: serializedAccount };
    }
    catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
}

export async function getAccounts() {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: { clerkUserId: userId }
    });
    if (!user) {
        throw new Error("User not found in database");
    }
    const accounts = await db.account.findMany({
        where: {
            userId: user.id
        },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { transactions: true } } }

    });
    const serializedAccounts = accounts.map(serializeAccount);
    return { success: true, data: serializedAccounts };
}

export const getDashboardData = async () => {
    try {
        const { userId } = await auth()
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })
        if (!user) {
            throw new Error("User not found in database");
        }
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        })
        const serializedAccounts = transactions.map(serializeAmount)
        return { success: true, data: serializedAccounts }

    }
    catch (err) {
        throw new Error("Failed to get dashboard data")
    }
}
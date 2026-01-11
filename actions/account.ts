"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import { serializeAccount } from "../lib/utils";


const serializeAccount = (account: any) => {
    const serialized = { ...account }

    if (account.balance) {
        serialized.balance = account.balance.toNumber();
    }
    if (account.amount) {
        serialized.amount = account.amount.toNumber();
    }

    return serialized;
};
export const updateDefaultAccount = async (accountId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!user) {
            throw new Error("User not found in database");
        }
        await db.account.updateMany(
            {
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            }
        );
        const account = await db.account.update(
            {
                where: { id: accountId },
                data: { isDefault: true }
            }
        );
        revalidatePath("/dashboard");
        return { success: true, data: serializeAccount(account) };
    }
    catch (err) {
        throw new Error("Failed to update default account");
    }
}

export const getAccountWithTransactions = async (accountId: string) => {

    try {
        console.log(accountId, "here");

        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!user) {
            throw new Error("User not found in database");
        }
        const account = await db.account.findUnique({
            where: { id: accountId, userId: user.id },
            include: {
                transactions: { orderBy: { createdAt: "desc" } },
                _count: { select: { transactions: true } }
            }
        });
        if (!account) {
            throw new Error("Account not found in database");
        }
        return {
            ...serializeAccount(account),
            transactions: account.transactions.map(serializeAccount)
        }
    } catch {
        throw new Error("User not authenticated");
    }
}
export const bulkDeleteTransactions = async (transactionIds: string[]) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!user) {
            throw new Error("User not found in database");
        }
        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds },
                userId: user.id
            }
        })

        const accountBalanceChanges = transactions.reduce((acc: any, transaction: any) => {
            const amount = transaction.type === "INCOME" ? -transaction.amount.toNumber() : transaction.amount.toNumber();
            if (acc[transaction.accountId]) {
                acc[transaction.accountId] += amount;
            } else {
                acc[transaction.accountId] = amount;
            }
            return acc;
        }, {})

        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactionIds },
                    userId: user.id
                }
            })
            // await tx.account.updateMany({
            //     where:{id:{in:Object.keys(accountBalanceChanges)}},
            //     data:accountBalanceChanges
            // })
            for (const [accountId, change] of Object.entries(accountBalanceChanges)) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: { increment: typeof change === "number" ? change : 0 }
                    }
                })
            }
        })
        revalidatePath("/dashboard");
        revalidatePath(`/account/[id]`);
        return { success: true }

    } catch (error) {
        throw new Error("Failed to delete transactions");
    }
}

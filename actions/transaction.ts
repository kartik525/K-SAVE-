"use server"

import aj from "@/app/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { GoogleGenAI } from "@google/genai";

const serializeAmount = (obj: any) => ({ ...obj, amount: obj.amount.toNumber() })
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
export const createTransaction = async (data: any) => {
    try {
        const { userId } = await auth()
        if (!userId) {
            throw new Error("User not authenticated");
        }

        // const req = await request()
        const h = await headers();

        const req = new Request("http://localhost", {
            headers: new Headers(h),
        });
        const decision = await aj.protect(req, {
            userId,
            requested: 1
        })
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset
                    }
                })
                throw new Error("Rate limit exceeded")
            }
            throw new Error("Access denied")
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })
        if (!user) {
            throw new Error("User not found in database");
        }
        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            }
        })
        if (!account) {
            throw new Error("Account not found in database");
        }
        console.log(data, "transaction data");

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data, userId: user.id,
                    nextRecurringDate: data?.isRecurring ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
                }
            })
            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance }
            })
            return newTransaction

        })

        revalidatePath("/dashboard");
        revalidatePath(`/account/${data.accountId}`);
        return { success: true, data: serializeAmount(transaction) }
    }
    catch (err: any) {
        console.log(err, "error creating transaction");

        throw new Error(err.message || "Failed to create transaction");
    }
}

export async function scanReceipt(file: any) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        const prompt = `

      Analyze this receipt image and extract the following information in JSON format:

      - Total amount (just the number)

      - Date (in ISO format)

      - Description or items purchased (brief summary)

      - Merchant/store name
      -type of transaction ("EXPENSE" or "INCOME")
      

      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

     

      Only respond with valid JSON in this exact format:

      {

        "amount": number,

        "date": "ISO date string",

        "description": "string",

        "merchantName": "string",

        "category": "string"

      }



      If its not a receipt, return an empty object

    `;



        // 2026 syntax for @google/genai
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash", // Use 2.5 series to avoid 404
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: base64String, mimeType: file.type } }
                    ]
                }
            ],
            // This is the "config" block for the new SDK
            config: {
                responseMimeType: "application/json"
            }
        });

        // const response = await result.response

        // const text = await response.text()

        // const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim()

        try {

            const data = JSON.parse(response.text || "");

            return {

                amount: parseFloat(data.amount),

                date: data.date,
                type: data.type,

                description: data.description,

                merchantName: data.merchantName,

                category: data.category

            }
        }

        catch (err: any) {
            console.error("Scanning Error:", err);
            throw new Error(err.message || "Failed to scan receipt");
        }

        // The new SDK returns data directly in response.text
        return JSON.parse(response.text || "");

    } catch (err: any) {
        console.error("Scanning Error:", err);
        throw new Error(err.message || "Failed to scan receipt");
    }
}

export const getTransactionById = async (id: string) => {
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
        const transaction = await db.transaction.findUnique({
            where: { id: id, userId: user.id }
        })
        if (!transaction) {
            throw new Error("Transaction not found in database");
        }
        return { success: true, data: serializeAmount(transaction) }

    }
    catch (err) {
        throw new Error("Failed to get transaction")
    }
}
export const updateTransaction = async (id: string, data: any) => {
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
        console.log(id, data, "data incoming");

        const transaction = await db.transaction.findUnique({
            where: { id: id, userId: user.id }
        })
        if (!transaction) {
            throw new Error("Transaction not found in database");
        }
        const oldBalance = transaction.type === "EXPENSE" ? - Number(transaction.amount) : Number(transaction.amount)
        const newBalance = data.type === "EXPENSE" ? - Number(data.amount) : Number(data.amount)
        const netBalanceChange = newBalance - oldBalance

        const updatedTransaction = await db.$transaction(async (tx) => {
            const updatedTransaction = await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    ...data,
                    nextRecurringDate: data?.isRecurring && data?.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
                }
            })
            const account = await tx.account.findUnique({
                where: { id: updatedTransaction.accountId }
            })
            if (!account) {
                throw new Error("Account not found in database");
            }
            await tx.account.update({
                where: { id: account.id },
                data: {
                    balance: Number(account.balance) + netBalanceChange
                }
            })
            return updatedTransaction
        })
        // const updatedTransaction = await db.transaction.update({
        //     where: { id: transaction.id },
        //     data
        // })
        // const account = await db.account.findUnique({
        //     where: { id: updatedTransaction.accountId }
        // })
        // if (!account) {
        //     throw new Error("Account not found in database");
        // }
        // await db.account.update({
        //     where: { id: account.id },
        //     data: {
        //         balance: Number(account.balance) + netBalanceChange
        //     }
        // })
        // if (!updatedTransaction) {
        //     throw new Error("Failed to update transaction");
        // }
        revalidatePath("/dashboard")
        revalidatePath(`/account/${updatedTransaction.accountId}`)
        return { success: true, data: serializeAmount(updatedTransaction) }

    }
    catch (err) {
        console.log(err)
        throw new Error("Failed to update transaction")
    }
}

function calculateNextRecurringDate(date: Date, interval: string) {
    const nextDate = new Date(date);
    switch (interval) {
        case "DAILY":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case "YEARLY":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            break;
    }
    return nextDate;
}
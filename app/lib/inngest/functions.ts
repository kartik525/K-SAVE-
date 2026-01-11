import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { number } from "zod";
import { GoogleGenAI } from "@google/genai";

export const checkAlertBudget = inngest.createFunction(
    { id: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const Budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true
                                }
                            }
                        }
                    }
                }
            })
        });

        for (const budget of Budgets) {
            const defaultAccount = budget.user.accounts[0]
            if (!defaultAccount) {
                continue;
            }
            await step.run(`check-budget-${budget.id}`, async () => {
                const startDate = new Date("2025-12-01");
                startDate.setDate(1);
                const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: "EXPENSE",
                        date: { gte: startOfMonth, lte: endOfMonth }
                    },
                    _sum: { amount: true }
                })
                console.log(expenses, "expenses");


                const totalExpense = expenses?._sum.amount || 0;
                const budgetAmount = budget.amount;
                console.log(budgetAmount, totalExpense, "expenses");

                const percentageUsed = (Number(totalExpense) / Number(budgetAmount)) * 100;
                console.log(budget, "percent used");

                if (percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {

                    await sendEmail({
                        to: budget.user.email,
                        subject: "Budget Alert",
                        body: EmailTemplate({ userName: budget.user.email, type: "budget-alert", data: { budgetAmount: Number(budgetAmount), percentageUsed, totalExpenses: Number(totalExpense) } })
                    })


                    await db.budget.update({
                        where: { id: budget.id },
                        data: { lastAlertSent: new Date() }
                    })
                }
            })
        }
    }
);

export const triggerRecurringTransactions = inngest.createFunction(
    {
        id: "trigger-recurring-transactions",
        name: "Trigger Recurring Transactions"
    },
    {
        cron: "0 0 * * *"
    },
    async ({ step }) => {
        console.log("heree we are");

        const RecurringTransactions: any = await step.run("fetch-recurring-transactions", async () => {
            let res = await db.transaction.findMany({
                where: {
                    isRecurring: true,
                    status: "COMPLETED",
                    OR: [
                        {
                            nextRecurringDate: {
                                lte: new Date()
                            }
                        },
                        {
                            lastProcessed: null
                        }
                    ]

                }
            })
            if (res.length > 0) {
                console.log(res, "ress");

                return res
            }
        })
        console.log(RecurringTransactions, "recurring transactions");

        if (RecurringTransactions.length > 0) {
            const events = RecurringTransactions?.map((transaction: any) => ({
                name: "transaction.recurring.process",
                data: {
                    transactionId: transaction.id,
                    userId: transaction.userId
                }
            }))
            // 3.Send events to be processed
            await inngest.send(events);

            console.log(RecurringTransactions, "recurring transactions");
        }
        return { triggered: RecurringTransactions.length }
    }

)

export const ProcessRecurringTransaction = inngest.createFunction(
    {
        id: "process-recurring-transaction",
        name: "Process Recurring Transaction",
        throttle: {
            limit: 1,
            period: "1m",
            key: "event.data.userId"
        }
    },
    {
        event: "transaction.recurring.process"
    },
    async ({ event, step }) => {
        const transaction = await step.run("fetch-recurring-transaction", async () => {
            return await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId
                },
                include: {
                    account: true
                }
            })
        })
        if (!transaction || !isTransactionDue(transaction)) {
            return
        }
        await db.$transaction(async (tx) => {

            await tx.transaction.create({
                data: {
                    userId: transaction.userId,
                    accountId: transaction.accountId,
                    type: transaction.type,
                    amount: transaction.amount,
                    description: transaction.description,
                    date: new Date(),
                    category: transaction.category,
                    isRecurring: transaction.isRecurring,
                    recurringInterval: transaction.recurringInterval,
                }
            })

            let balance: any = transaction?.type === "EXPENSE" ? Number(transaction.account.balance) - Number(transaction.amount) : Number(transaction.account.balance) + Number(transaction.amount)

            await tx.account.update({
                where: {
                    id: transaction.accountId
                },
                data: {
                    balance
                }
            })

            await tx.transaction.update({
                where: {
                    id: transaction.id
                },
                data: {
                    lastProcessed: new Date(),
                    nextRecurringDate: calculateNextRecurringDate(new Date(), transaction.recurringInterval || "")
                }
            })
        })
    }
)
export const GetMonthlyReport = inngest.createFunction(
    {
        id: "get-monthly-report",
        name: "Get Monthly Report",
    },
    {
        cron: "0 0 1 * *"
    },
    async ({ step }) => {
        const users = await step.run("fetch-user", async () => {
            return await db.user.findMany({
                include: {
                    accounts: true
                }
            })
        })

        for (const user of users) {
            await step.run("send-monthly-report", async () => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                const stats = await getMonthlyStats(user.id, lastMonth);

                const monthName = lastMonth.toLocaleString('default', { month: 'long' });

                const insights = await getMonthlyInsights(stats, monthName);
                console.log(insights, "insights");


                await sendEmail({
                    to: user.email,
                    subject: `Monthly Report for ${monthName}`,
                    body: EmailTemplate({ userName: user.name || "", type: "monthly-report", data: { stats, month: monthName, insights: insights } })
                })
            })
        }
        return { processed: users.length }
    }

)
export const getMonthlyInsights = async (stats: any, monthName: string) => {
    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${monthName}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
                .map(([category, amount]) => `${category}: $${amount}`)
                .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash", // Use 2.5 series to avoid 404
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                    ]
                }
            ],
            // This is the "config" block for the new SDK
            config: {
                responseMimeType: "application/json"
            }
        });
        const data = JSON.parse(response.text || "");

        return data




    }
    catch (err) {
        throw new Error("Failed to get monthly insights")
    }
}

const getMonthlyStats = async (userId: string, lastMonth: Date) => {
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    const transactions = await db.transaction.findMany({
        where: {
            userId: userId,
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    })

    return transactions.reduce((stats: any, transaction: any) => {
        if (transaction.type === "INCOME") {
            stats.income += Number(transaction.amount);
        } else {
            stats.expense += Number(transaction.amount);
            stats.byCategory[transaction.category] = (stats.byCategory[transaction.category] || 0) + Number(transaction.amount)
        }
        return stats;
    }, { income: 0, expense: 0, byCategory: {}, transactionCount: transactions.length });
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

const isTransactionDue = (transaction: any) => {
    if (!transaction.lastProcessed) {
        return true
    }
    const nextRecurringDate = new Date(transaction.nextRecurringDate);
    const today = new Date();
    return nextRecurringDate.getDate() === today.getDate() && nextRecurringDate.getMonth() === today.getMonth() && nextRecurringDate.getFullYear() === today.getFullYear();
}

const isNewMonth = (lastAlertDate: Date, date: Date) => {
    return (
        lastAlertDate.getMonth() !== date.getMonth() ||
        lastAlertDate.getFullYear() !== date.getFullYear()
    )
}
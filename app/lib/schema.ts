import { z } from "zod";
export const accountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Balance must be a positive number"),
    isDefault: z.boolean().default(false)
})

export const transactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    date: z.date("Date is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),

}).superRefine(({ isRecurring, recurringInterval }, ctx) => {
    if (isRecurring && !recurringInterval) {
        ctx.addIssue({
            code: "custom",
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"]
        })
    }
})  
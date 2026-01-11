import { inngest } from "@/app/lib/inngest/client";
import { checkAlertBudget, GetMonthlyReport, ProcessRecurringTransaction, triggerRecurringTransactions } from "@/app/lib/inngest/functions";
import { serve } from "inngest/next";
// import { inngest } from "../../../inngest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        checkAlertBudget,
        triggerRecurringTransactions,
        ProcessRecurringTransaction,
        GetMonthlyReport

        /* your functions will be passed here later! */
    ],
});
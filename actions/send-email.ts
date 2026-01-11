"use server"
import { Resend } from "resend"

export async function sendEmail({ to, subject, body }: any) {
    const resend = new Resend(process.env.Resend_Key)
    try {
        console.log(to, subject, body, "subject mail body");

        const data = await resend.emails.send({
            from: "Resend<onboarding@resend.dev>",
            to: to,
            subject: subject,
            react: body
        })
        console.log(data, "data");


        return { success: true, data: data }

    }
    catch (error) {
        console.log(error)
    }

}
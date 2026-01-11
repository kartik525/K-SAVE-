import { currentUser } from "@clerk/nextjs/server"
import { ca } from "date-fns/locale"
import { db } from "./prisma"

export const checkUser = async () => {
    const user = await currentUser()
    if (!user) {
        return null
    }
    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id
            }
        })
        if (loggedInUser) {
            return loggedInUser
        }

        if (!loggedInUser) {
            const newUser = await db.user.create({
                data: {
                    clerkUserId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name: user.firstName + " " + user.lastName
                }
            })
            return newUser
        }
    }
    catch (err) {
        console.log("Error checking user:", err)
        return null
    }
}
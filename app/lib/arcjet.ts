import arcjet, { tokenBucket } from '@arcjet/next'

const aj = arcjet({
    key: process.env.ARCJET_KEY || "ajkey_01kcxx2t4ce06szk598b81xtp9",
    characteristics: ['userId'],
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 10,
            interval: 3600,
            capacity: 10,
        })
    ]

})

export default aj
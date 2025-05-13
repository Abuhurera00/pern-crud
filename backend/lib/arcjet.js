import arcjet, { tokenBucket, shield, detectBot } from '@arcjet/node'

//init arcjet

export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        // sheild protect your app from common attacks e.g SQL injection, XSS, CSRF Attacks
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            // block all the bots excepts the search engines
            allow: [
                "CATEGORY:SEARCH_ENGINE"
                // see the full list at https://arcjet.com/bot-list
            ]
        }),
        // rate limiting  
        tokenBucket({
            mode: "LIVE",
            refillRate: 5,
            interval: 10,  // 10 seconds
            capacity: 10   // 10 tokens
        })
    ]
})
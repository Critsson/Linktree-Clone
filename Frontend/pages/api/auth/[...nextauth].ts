import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios"
const bcrypt = require("bcrypt")

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {
                loginUsername: {
                    type: "text"
                },
                loginPassword: {
                    type: "password"
                }
            },
            async authorize(credentials, req) {

                const data = (await axios.post(`http://localhost:5000/api/login`, {
                    username: credentials?.loginUsername,
                    password: credentials?.loginPassword
                })).data
            
                return {id: data.id, name: data.username}

            }
        })
    ],
    pages: {
        signIn: "/"
    },
    secret: "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIALMhQkpyaGIBq0zGDKdB2hbMfr1lGHinoXYFvekl6xI4rcd1WLD49nwF8UJbh9nh+1PYTPTvfQYQGdN6vVJ6HAgaf9LG6yFB0ffrHzNEj3bOknFzwXIDvbFof6s1+RCHEhgHNjM7fa/cxkJur2lHmfcrEzBRZv7/ShC8yNF+plAgMBAAECgYAM7RRpJCoboX6sM4ROYSHHu/wXUp+YK263VJTNsXJlTMyhwA/r+tXfTEIHVylXrpa/7LQBLEx0h/zDBPQRzLrrXM1jOZ9IPpZfVVGq0bs4vcEDJuu3OWl2q0/Sz2z1px6fjEyIsNmhmaIALpHKzZcGrNYnZ6YFDsGc7Q3o0p7PAQJBALaD164yie0ZGa9F7/uOw+7ISN2Ih6DFM8RjEk5uB3LPYsDrZlAVJrNEcnNEffibk6Cihto6W5Sc7So809vBp00CQQCzmOYD96ePez+ohYV5HYfIMDMEki6JhW/p38xgcHwtiPjnsuJ1KGC9GT4PJO0rtxu1QyelWd7ju9Mzhp5IabN5AkApprTVwBrRzOSbpy45Dj+Qgox+YeXxvo8txh4rX9i7TrCOrinPJMSMLJahz4Of9IEgK3by3lZ/97/336HJiMwRAkEAi/fpq8XjLQuc/TWyZEYDgJ0v5awX4M3B/r+QhMilvsc1VT4xB6XEXxvBJgRdYuh+C7Kev1tfPpUvcMTFryHR4QJBAKOSG+2AGLwXQ0yT7uPKy6bqWxJLPkMexSMpwL25S+c986zmTYaROHgBbwQHjwSxzmM+fjiPnKQAGKncdNqWQY8="
}

export default NextAuth(authOptions)
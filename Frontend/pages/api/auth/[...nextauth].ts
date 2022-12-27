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

                const data = (await axios.get(`http://localhost:5000/api/users/${credentials?.loginUsername.toLowerCase()}`)).data[0]

                const isValid = await bcrypt.compare(credentials?.loginPassword, data.password)

                if (!isValid) {
                    throw new Error("Invalid Password")
                } else {
                    return { id: data.id, name: data.username }
                }
                
            }
        })
    ],
    pages: {
        signIn: "/"
    }
}

export default NextAuth(authOptions)
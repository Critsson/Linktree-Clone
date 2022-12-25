import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios"
const bcrypt = require("bcrypt")

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {

            },
            async authorize(credentials, req) {

                const { loginUsername, loginPassword } = credentials as {
                    loginUsername: string,
                    loginPassword: string
                }

                const data = (await axios.get(`http://localhost:5000/api/users/${loginUsername.toLowerCase()}`)).data[0]

                const isValid = await bcrypt.compare(loginPassword, data.password)

                if(!isValid) {
                    throw new Error("Invalid Password")
                }

                return {id: data.id, username: data.username}
                
            }
        })
    ],
    pages: {
        signIn: "/"
    }
}

export default NextAuth(authOptions)
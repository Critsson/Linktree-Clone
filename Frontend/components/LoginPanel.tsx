import React from 'react'
import useWindowSize from '../useWindowSize'
import styles from "../styles/Extras.module.css"
import { motion } from "framer-motion"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { CircularProgress } from '@mui/material'

const LoginPanel = () => {

    const router = useRouter()
    const [isChecking, setIsChecking] = React.useState(false)
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const windowSize = useWindowSize()
    const loginPanelContainerMobile = {
        backgroundColor: "#ffffff",
        width: "90vw",
        height: "60vw",
        borderRadius: "2vw",
        border: "1.1vw #202430 solid",
        boxShadow: "2vw 2.5vw 0 .5vw #202430",
        display: "flex",
        flexDirection: "column" as "column",
        paddingTop: "4vw"
    }
    const loginPanelContainerDesktop = {
        backgroundColor: "#ffffff",
        width: "40vw",
        height: "25vw",
        borderRadius: "1vw",
        border: ".3vw #202430 solid",
        boxShadow: ".6vw .6vw 0 .1vw #202430",
        display: "flex",
        flexDirection: "column" as "column",
        paddingTop: "3.5vw"
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsChecking(true)

        const res = await signIn("credentials", {
            loginUsername: username,
            loginPassword: password,
            callbackUrl: '/admin',
            redirect: false
        })

        console.log(res)
        setIsChecking(false)

        if (res?.error === null) {
            router.push("/admin")
        }
    }

    return (
        <div style={windowSize.width > 640 ? loginPanelContainerDesktop : loginPanelContainerMobile}>
            <form onSubmit={(e) => handleSubmit(e)} style={windowSize.width > 640 ? { display: "flex", flexDirection: "column", alignItems: "center", gap: "1.9vw" } : { display: "flex", flexDirection: "column", alignItems: "center", gap: "5vw" }}>
                <input onChange={(e) => setUsername((e.target.value))} value={username} style={windowSize.width > 640 ? {
                    width: "30vw", height: "4vw", fontFamily: "Inter, sans-serif", fontSize: "1.8vw", boxShadow: ".4vw .4vw 0 0vw #202430", border: ".3vw #202430 solid", borderRadius: ".5vw",
                    paddingLeft: ".8vw", fontWeight: "500", outlineWidth: "0vw", color: "#202430"
                }
                    :
                    {
                        width: "70vw", height: "10vw", fontFamily: "Inter, sans-serif", fontSize: "5vw", boxShadow: "1.1vw 1.1vw 0 0vw #202430", border: "1vw #202430 solid", borderRadius: "2vw",
                        paddingLeft: "1vw", fontWeight: "500", outlineWidth: "0vw", color: "#202430"
                    }} placeholder='Username'></input>
                <input onChange={(e) => setPassword(e.target.value)} type="password" value={password} style={windowSize.width > 640 ? {
                    width: "30vw", height: "4vw", fontFamily: "Inter, sans-serif", fontSize: "1.8vw", boxShadow: ".4vw .4vw 0 0vw #202430", border: ".3vw #202430 solid", borderRadius: ".5vw",
                    paddingLeft: ".8vw", fontWeight: "500", outlineWidth: "0vw", color: "#202430"
                }
                    :
                    {
                        width: "70vw", height: "10vw", fontFamily: "Inter, sans-serif", fontSize: "5vw", boxShadow: "1.1vw 1.1vw 0 0vw #202430", border: "1vw #202430 solid", borderRadius: "2vw",
                        paddingLeft: "1vw", fontWeight: "500", outlineWidth: "0vw", color: "#202430"
                    }} placeholder='Password'></input>
                {!isChecking ? <motion.button whileTap={{ scale: 0.9 }} type="submit" className={styles.hover_cursor} style={windowSize.width > 640 ? {
                    height: "4vw", width: "13vw", fontFamily: "Inter, sans-serif", backgroundColor: "#7895B2", border: ".3vw #202430 solid ",
                    borderRadius: ".5vw", fontSize: "2.3vw", fontWeight: "700", color: "white", boxShadow: ".3vw .3vw 0 0vw #202430"
                }
                    :
                    {
                        height: "10vw", width: "40vw", fontFamily: "Inter, sans-serif", backgroundColor: "#7895B2", border: "1vw #202430 solid ",
                        borderRadius: "2vw", fontSize: "5.5vw", fontWeight: "700", color: "white", boxShadow: "1.1vw 1.1vw 0 0vw #202430"
                    }}>Login!</motion.button> : <div style={windowSize.width > 640 ? { height: "4vw", width: "13vw", display: "flex", justifyContent: "center", alignItems: "center" }
                        :
                        { height: "10vw", width: "40vw", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress sx={{ color: "#202430" }} /></div>}
                <Link href="/signup" style={{ textDecoration: "none" }}>
                    <h3 style={windowSize.width > 640 ? {
                        color: "#757575", fontSize: "1.2vw"
                    } : {
                        color: "#757575", fontSize: "4vw"
                    }}>Sign Up</h3>
                </Link>
            </form>
        </div>
    )
}

export default LoginPanel
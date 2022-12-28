import React from 'react'
import { motion } from 'framer-motion'

interface props {
    windowWidth: number,
    usernameNotValid: boolean,
    passwordNotValid: boolean
}

const SignUpHelper = (props: props) => {

    const usernameHelperContainerMobile = {
        left: "5vw",
        top: "2vh",
        height: "36vw",
        width: "90vw",
        backgroundColor: "white",
        borderRadius: "2vw",
        outline: "1.1vw #202430 solid",
        boxShadow: "1.5vw 1.5vw 0 1vw #202430",
        padding: ".5vw 2vw",
        position: "absolute"
    }

    const usernameHelperContainerDesktop = {
        position: "absolute",
        right: "8vw",
        top: "31vh",
        height: "18vw",
        width: "20vw",
        backgroundColor: "white",
        borderRadius: "1vw",
        outline: ".3vw #202430 solid",
        boxShadow: ".6vw .6vw 0 .1vw #202430",
        padding: ".8vw 1vw"
    }


    return (
        //@ts-ignore
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} style={props.windowWidth > 640 ? usernameHelperContainerDesktop : usernameHelperContainerMobile}>
            <div style={props.windowWidth > 640 ? { display: "flex", flexDirection: "column", color: "#202430", gap: ".6vw" } : { display: "flex", flexDirection: "column", color: "#202430", gap: ".4vw" }}>
                <h3 style={props.windowWidth > 640 ? { fontSize: "1.3vw" } : { fontSize: "4.5vw" }}>Username Must:</h3>
                <p style={props.windowWidth > 640 ? { fontSize: "1.1vw", fontWeight: "500" } : { fontSize: "3.2vw", fontWeight: "500" }}>Contain at least one letter or number</p>
                <p style={props.windowWidth > 640 ? { fontSize: "1.1vw", fontWeight: "500" } : { fontSize: "3.2vw", fontWeight: "500" }}>Have a length that is less than 20</p>
                <p style={props.windowWidth > 640 ? { fontSize: "1.1vw", fontWeight: "500" } : { fontSize: "3.2vw", fontWeight: "500" }}>Contain only letters and numbers</p>
                <h3 style={props.windowWidth > 640 ? { fontSize: "1.3vw" } : { fontSize: "4.5vw" }}>Password Must:</h3>
                <p style={props.windowWidth > 640 ? { fontSize: "1.1vw", fontWeight: "500" } : { fontSize: "3.2vw", fontWeight: "500" }}>Have a length between 8 and 50</p>
                <p style={props.windowWidth > 640 ? { fontSize: "1.1vw", fontWeight: "500" } : { fontSize: "3.2vw", fontWeight: "500" }}>Contain at least one letter and number</p>
            </div>
        </motion.div>
    )
}

export default SignUpHelper
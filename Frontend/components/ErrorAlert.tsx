import React from 'react'
import { Alert, AlertTitle } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';

interface props {
    message: string | undefined
}

const ErrorAlert = (props: props) => {

    const [rendered, setRendered] = React.useState(true)
    let errorAlertElement;

    React.useEffect(() => {
        setTimeout(() => {
            setRendered(false)
        }, 3000)
    }, [])

    if (props.message === "Request failed with status code 401") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Username or password is incorrect</strong></AlertTitle>
            Are you sure that your username and/or password is correct?
        </Alert></motion.div>
    } else if (props.message === "Invalid Password") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Password is incorrect</strong></AlertTitle>
            The password that was entered is incorrect. Please try again.
        </Alert></motion.div>
    } else if (props.message === "No username entered") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>No username entered</strong></AlertTitle>
            Oops! Dont&apos;t forget your username.
        </Alert></motion.div>
    } else if (props.message === "No password entered") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>No password entered</strong></AlertTitle>
            Oops! Don&apos;t forget your password.
        </Alert></motion.div>
    } else if (props.message === "Nothing entered") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>No username or password entered</strong></AlertTitle>
            You do realize you need a username and a password to login right?
        </Alert></motion.div>
    } else if (props.message === "Invalid username and password") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Invalid username and password</strong></AlertTitle>
            Both your intended username and password do not meet the requirements. Please try again.
        </Alert></motion.div>
    } else if (props.message === "Invalid username") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Invalid username</strong></AlertTitle>
            Intended username does not meet username requirements. Please try again.
        </Alert></motion.div>
    } else if (props.message === "Invalid password") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Invalid password</strong></AlertTitle>
            Intended password does not meet password requirements. Please try again.
        </Alert></motion.div>
    } else if (props.message === "Username already exists") {
        errorAlertElement = <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: .2 }}><Alert sx={{ fontFamily: "Inter" }} onClose={() => setRendered(false)} severity='warning'>
            <AlertTitle><strong>Username already exists</strong></AlertTitle>
            Unfortunately the username you entered already exists. Please try again.
        </Alert></motion.div>
    } else {
        errorAlertElement = <></>
    }

    return (
        <AnimatePresence>
            {rendered && errorAlertElement}
        </AnimatePresence>
    )
}

export default ErrorAlert
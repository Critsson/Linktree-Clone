import useWindowSize from '../useWindowSize'
import LoginPanel from '../components/LoginPanel'
import LinkIcon from '@mui/icons-material/Link';
import React from "react"
import axios from "axios"
import ErrorAlert from '../components/ErrorAlert';
import SignUpHelper from '../components/SignUpHelper';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { CircularProgress } from "@mui/material"

export default function Home() {

  const windowSize = useWindowSize()
  const homePageContainerMobile = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    paddingRight: "2vw",
    height: "100vh",
    width: "100vw",
    paddingTop: "25vh",
    backgroundColor: "#AEBDCA",
    fontFamily: "Inter, sans-serif"
  }
  const homePageContainerDesktop = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    paddingTop: "17vh",
    backgroundColor: "#AEBDCA",
    fontFamily: "Inter, sans-serif",
  }

  const [errorAlertElements, setErrorAlertElements] = React.useState<JSX.Element[]>([])
  const router = useRouter()
  const [usernameNotValid, setUsernameNotValid] = React.useState(true)
  const [passwordNotValid, setPasswordNotValid] = React.useState(true)
  const [inSignup, setInSignup] = React.useState(false)
  const [isAuthenticating, setIsAuthenticating] = React.useState(false)

  const handleSignInAlert = (message: string | undefined) => {
    setErrorAlertElements((prevState) => {
      const placeholder = [...prevState]
      placeholder.push(<ErrorAlert key={Date.now()} message={message}></ErrorAlert>)
      return placeholder
    })
  }

  const handleUsernameValidity = (usernameNotValid: boolean) => {
    setUsernameNotValid(usernameNotValid)
  }

  const handlePasswordValidity = (passwordNotValid: boolean) => {
    setPasswordNotValid(passwordNotValid)
  }

  const handleInSignup = (inSignup: boolean) => {
    setInSignup(inSignup)
  }

  React.useEffect(() => {
    const validate = async () => {
      try {
        const validateRes = await axios.get("http://44.201.234.255:5000/api/validate", {
          withCredentials: true
        })
        setIsAuthenticating(false)
        router.push("/admin")
      } catch (error) {
      }
    }

    validate()

  }, [router])

  if (isAuthenticating) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100vw", height: "100vh" }}>
      <CircularProgress sx={{ color: "#202430" }} />
    </div>
  }

  return (
    <div style={windowSize.width > 640 ? homePageContainerDesktop : homePageContainerMobile}>
      <div style={windowSize.width > 640 ? { display: "flex", justifyContent: "center" } : { display: "flex", justifyContent: "center", marginBottom: "-1vw" }}>
        <LinkIcon sx={windowSize.width > 640 ? { height: "5.5vw", width: "5.5vw", color: "#202430" } : { height: "17.4vw", width: "17.4vw", color: "#202430" }} />
        <h1 style={windowSize.width > 640 ? { fontSize: "4vw", color: "#202430" } : { fontSize: "13vw", color: "#202430" }}>chainlink</h1>
      </div>
      <LoginPanel passwordNotValid={passwordNotValid} usernameNotValid={usernameNotValid} handleUsernameValidity={handleUsernameValidity} handlePasswordValidity={handlePasswordValidity} handleInSignup={handleInSignup} handleSignInAlert={handleSignInAlert} />
      <div style={windowSize.width > 640 ? { display: "flex", flexDirection: "column", position: "absolute", left: "1vw", bottom: "1vw", width: "25vw", gap: "1vw" }
        :
        { display: "flex", flexDirection: "column", position: "absolute", bottom: "2vw", alignItems: "center", width: "90vw", gap: "1vw" }}>
        {errorAlertElements}
      </div>
      <AnimatePresence>
        {inSignup === true && <SignUpHelper windowWidth={windowSize.width} usernameNotValid={usernameNotValid} passwordNotValid={passwordNotValid} />}
      </AnimatePresence>
    </div>
  )
}

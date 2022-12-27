import useWindowSize from '../useWindowSize'
import LoginPanel from '../components/LoginPanel'
import LinkIcon from '@mui/icons-material/Link';
import React from "react"
import ErrorAlert from '../components/ErrorAlert';
import SignUpHelper from '../components/SignUpHelper';
import { motion } from 'framer-motion';

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
    paddingTop: "19vh",
    backgroundColor: "#AEBDCA",
    fontFamily: "Inter, sans-serif",
  }

  const [errorAlertElements, setErrorAlertElements] = React.useState<JSX.Element[]>([])
  const [inputFocused, setInputFocused] = React.useState("")
  const [usernameNotValid, setUsernameNotValid] = React.useState(true)
  const [passwordNotValid, setPasswordNotValid] = React.useState(true)

  const handleSignInAlert = (message: string | undefined) => {
    setErrorAlertElements((prevState) => {
      const placeholder = [...prevState]
      placeholder.push(<ErrorAlert key={Date.now()} message={message}></ErrorAlert>)
      return placeholder
    })
  }

  const handleInputFocus = (input: string) => {
    setInputFocused(input)
  }

  const handleUsernameValidity = (usernameNotValid: boolean) => {
    setUsernameNotValid(usernameNotValid)
  }

  const handlePasswordValidity = (passwordNotValid: boolean) => {
    setPasswordNotValid(passwordNotValid)
  }

  return (
    <div style={windowSize.width > 640 ? homePageContainerDesktop : homePageContainerMobile}>
      <div style={windowSize.width > 640 ? { display: "flex", justifyContent: "center" } : { display: "flex", justifyContent: "center", marginBottom: "-1vw" }}>
        <LinkIcon sx={windowSize.width > 640 ? { height: "5.5vw", width: "5.5vw", color: "#202430" } : { height: "17.4vw", width: "17.4vw", color: "#202430" }} />
        <h1 style={windowSize.width > 640 ? { fontSize: "4vw", color: "#202430" } : { fontSize: "13vw", color: "#202430" }}>chainlink.</h1>
      </div>
      <LoginPanel handleUsernameValidity = {handleUsernameValidity} handlePasswordValidity = {handlePasswordValidity} handleInputFocus={handleInputFocus} handleSignInAlert={handleSignInAlert} />
      <div style={windowSize.width > 640 ? { display: "flex", flexDirection: "column", position: "absolute", left: "1vw", bottom: "1vw", width: "25vw", gap: "1vw" }
        :
        { display: "flex", flexDirection: "column", position: "absolute", bottom: "2vw", alignItems: "center", width: "90vw", gap: "1vw" }}>
        {errorAlertElements}
      </div>
      <motion.div>
        {inputFocused === "username" && <SignUpHelper windowWidth={windowSize.width} usernameNotValid={usernameNotValid} passwordNotValid={passwordNotValid} />}
      </motion.div>
    </div>
  )
}

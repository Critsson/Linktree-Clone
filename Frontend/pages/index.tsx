import useWindowSize from '../useWindowSize'
import LoginPanel from '../components/LoginPanel'
import LinkIcon from '@mui/icons-material/Link';

export default function Home() {

  const windowSize = useWindowSize()
  const homePageContainerMobile = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
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

  return (
    <div style={windowSize.width > 640 ? homePageContainerDesktop : homePageContainerMobile}>
      <div style={windowSize.width > 640 ? { display: "flex", justifyContent: "center", marginBottom: "-.5vw" } : {display: "flex", justifyContent: "center", marginBottom: "-1.5vw"}}>
        <LinkIcon sx={windowSize.width > 640 ? { height: "5.5vw", width: "5.5vw", color: "#202430" } : { height: "17.4vw", width: "17.4vw", color: "#202430" }} />
        <h1 style={windowSize.width > 640 ? { fontSize: "4vw", color: "#202430" } : {fontSize: "13vw", color: "#202430"}}>chainlink.</h1>
      </div>
      <LoginPanel />
    </div>
  )
}

import React from 'react'
import { useRouter } from 'next/router'
import { CircularProgress } from "@mui/material"
import axios from 'axios'

const AdminPage = () => {

  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {

    const validate = async () => {
      try {
        const validateRes = await axios.get("http://44.201.234.255:5000/api/validate", {
          withCredentials: true
        })
        setIsLoading(false)
      } catch (error) {
        router.push("/")
      }
    }

    validate()

  }, [router])

  const handleLogout = async () => {
      const logoutRes = await axios.get("http://localhost:5000/api/logout", {
        withCredentials: true
      })
      router.push("/")
  }

  if (isLoading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100vw", height: "100vh" }}>
      <CircularProgress sx={{ color: "#202430" }} />
    </div>
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default AdminPage

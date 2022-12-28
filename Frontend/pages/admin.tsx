import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { CircularProgress } from "@mui/material"

const AdminPage = () => {

  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/")
    }
  })

  if (status === "loading") {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
      <CircularProgress sx={{ color: "lightgrey" }} />
    </div>
  }

  console.log(session)

  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
    </div>
  )
}

export default AdminPage
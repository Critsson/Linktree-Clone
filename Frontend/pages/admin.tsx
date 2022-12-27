import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

const AdminPage = () => {

  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/")
    }
  })

  if(status === "loading") {
    return <h3>Loading or not authenticated...</h3>
  }

  console.log(session)

  return (
    <div>
      <button onClick={() => signOut({callbackUrl: "/"})}>Sign Out</button>
    </div>
  )
}

export default AdminPage
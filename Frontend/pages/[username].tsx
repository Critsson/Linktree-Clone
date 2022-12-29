import React from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next/types'
import { CircularProgress, Avatar } from '@mui/material'
import styles from '../styles/UserPage.module.css'
import LinkButton from '../components/LinkButton'
import useWindowSize from '../useWindowSize'

export default function UserPage({ userData }: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const fetchData = async (username: string | string[] | undefined) => {
        if (typeof username === "string") {
            return (await axios.get(`http://44.201.234.255:5000/api/users/${username.toLowerCase()}`)).data
        }
    }

    const router = useRouter()
    const { username } = router.query
    const { isLoading, data } = useQuery({ queryKey: ["user-page-query"], queryFn: async () => await fetchData(username), placeholderData: userData })
    const windowSize = useWindowSize()


    const userPageContainerMobile = {
        display: "flex",
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        flexDirection: "column" as "column",
        fontFamily: "Inter, sans-serif",
        gap: "5vw",
        paddingTop: "8vw",
        backgroundColor: `#${data.bgcolor}`
    }

    const userPageContainerDesktop = {
        display: "flex",
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        flexDirection: "column" as "column",
        fontFamily: "Inter, sans-serif",
        gap: "1.5vw",
        paddingTop: "3vw",
        backgroundColor: `#${data.bgcolor}`
    }


    if (isLoading) {
        return (
            <div className={styles.user_page_container}>
                <CircularProgress sx={{ color: "grey" }} />
            </div>
        )
    }

    const linkButtonElements = data.links ? data.links.map((linkObject: { link: string, title: string }) => {
        return <LinkButton key={linkObject.link} link={linkObject.link} title={linkObject.title} buttonColor={data.buttoncolor} fontColor={data.fontcolor} />
    }) : []

    return (
        <div style={windowSize.width > 640 ? userPageContainerDesktop : userPageContainerMobile}>
            <Avatar sx={windowSize.width > 640 ?
                { backgroundColor: `#${data.avatarbgcolor}`, fontFamily: "Inter, sans-serif", width: "5vw", height: "5vw", fontSize: "3vw", color: `#${data.avatarfontcolor}`, marginBottom: "-1vw" }
                :
                { backgroundColor: `#${data.avatarbgcolor}`, fontFamily: "Inter, sans-serif", width: "25vw", height: "25vw", fontSize: "16vw", color: `#${data.avatarfontcolor}`, marginBottom: "-2vw" }}>
                {data.username[0].toUpperCase()}</Avatar>
            <h1 style={windowSize.width > 640 ?
                { fontSize: "1.5vw", color: `#${data.tagcolor}` }
                :
                { fontSize: "7vw", color: `#${data.tagcolor}` }}>{`@${data.username}`}</h1>
            <div className={styles.user_page_button_container}>
                {linkButtonElements}
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {

    const { params } = context
    const username = params?.username
    let userData;

    if (typeof username === "string") {
        userData = (await axios.get(`http://localhost:5000/api/users/${username.toLowerCase()}`)).data
    }

    return {
        props: {
            userData
        }
    }
}
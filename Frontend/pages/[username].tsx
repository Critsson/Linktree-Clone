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
        return (await axios.get(`http://localhost:5000/users/${username}`)).data[0]
    }

    const userPageContainerMobile = {
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column" as "column",
        fontFamily: "Inter, sans-serif",
        gap: "3vw",
        paddingTop: "8vw"
    }

    const userPageContainerDesktop = {
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column" as "column",
        fontFamily: "Inter, sans-serif",
        paddingTop: "2vw",
        gap: "1vw"
}

    const router = useRouter()
    const { username } = router.query
    const { isLoading, data } = useQuery({ queryKey: ["user-page-query"], queryFn: async () => await fetchData(username), placeholderData: userData })
    const windowSize = useWindowSize()

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
                { backgroundColor: `#${data.buttoncolor}`, width: "8vw", height: "8vw", fontSize: "5vw", color: `#${data.bgcolor}`, marginBottom: "-1vw" }
                :
                { backgroundColor: `#${data.buttoncolor}`, width: "20vw", height: "20vw", fontSize: "12vw", color: `#${data.bgcolor}`, marginBottom: "-2vw" }}>
                {data.username[0].toUpperCase()}</Avatar>
            <h1 style={windowSize.width > 640 ?
                { fontSize: "5vw", color: `#${data.fontcolor}` }
                :
                { fontSize: "11vw", color: `#${data.fontcolor}` }}>{`@${data.username}`}</h1>
            <div className={styles.user_page_button_container}>
                {linkButtonElements}
                <LinkButton key="1" link="https://chrisgao.dev" title="This is a test to see whether or not the words wrap around the button" buttonColor={data.buttoncolor} fontColor={data.fontcolor} />
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {

    const { params } = context
    const username = params?.username
    const userData = (await axios.get(`http://localhost:5000/users/${username}`)).data[0]


    return {
        props: {
            userData
        }
    }
}
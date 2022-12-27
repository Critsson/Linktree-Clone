import React from 'react'

interface props {
    windowWidth: number,
    usernameNotValid: boolean,
    passwordNotValid: boolean
}

const SignUpHelper = (props: props) => {

    const usernameHelperContainerMobile = {

    }

    const usernameHelperContainerDesktop = {
        position: "absolute",
        right: "8vw",
        top: "31vh",
        height: "15vw",
        width: "20vw",
        backgroundColor: "white",
        borderRadius: "1vw",
        outline: ".3vw #202430 solid",
        boxShadow: ".6vw .6vw 0 .1vw #202430",
        padding: ".5vw 1.3vw"
    }


    return (
        <div style={props.windowWidth > 640 ? usernameHelperContainerDesktop : usernameHelperContainerMobile}>
            <div style={{ display: "flex", flexDirection: "column", color: "#202430", gap: ".2vw" }}>
                <h3 style={{ fontSize: "1.3vw" }}>Username Must:</h3>
                <p style={{ fontSize: "1.1vw" }}>Contain at least one letter or number</p>
                <p style={{ fontSize: "1.1vw" }}>Have a length that is less than 20</p>
                <p style={{ fontSize: "1.1vw" }}>Contain only letters and numbers</p>
                <h3 style={{ fontSize: "1.3vw" }}>Password Must:</h3>
                <p style={{ fontSize: "1.1vw" }}>Have a length between 8 and 50</p>
                <p style={{ fontSize: "1.1vw" }}>Contain at least one letter and number</p>
            </div>
        </div>
    )
}

export default SignUpHelper
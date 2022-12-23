import React from 'react'
import useWindowSize from '../useWindowSize'

interface linkButtonProps {
    link: string,
    title: string,
    buttonColor: string,
    fontColor: string
}

const LinkButton = (props: linkButtonProps) => {

    const buttonStyleMobile = {
        width: "80vw",
        minHeight: "10vw",
        fontSize: "4vw",
        backgroundColor: `#${props.buttonColor}`,
        borderColor: `#${props.buttonColor}`,
        padding: "1vw 1vw",
        fontColor: `#${props.fontColor}`,
        fontWeight: "700",
        borderRadius: ".3vw"
    }

    const buttonStyleDesktop = {
        width: "35vw",
        minHeight: "3vw",
        fontSize: "2vw",
        backgroundColor: `#${props.buttonColor}`,
        borderColor: `#${props.buttonColor}`,
        padding: "1vw 1vw",
        fontColor: `#${props.fontColor}`,
        fontWeight: "700",
        borderRadius: ".3vw"
    }

    const { link, title } = props
    const windowSize = useWindowSize();

    return (
        <a href={link} target="_blank" rel="noreferrer">
            <button style={windowSize.width > 640 ? buttonStyleDesktop : buttonStyleMobile}>
                {title}
            </button>
        </a>
    )
}

export default LinkButton

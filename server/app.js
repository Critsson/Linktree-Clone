const express = require("express")
require("dotenv").config({ path: "./.env.local" })
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const rateLimit = require("express-rate-limit")
const https = require("https")
const fs = require("fs")
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/chainlink.restapi.ca/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/chainlink.restapi.ca/cert.pem")
}
const app = express();
const saltRounds = 12;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

const limiter = rateLimit({
    windowMs: 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests. Please try again later"
})

app.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        res.redirect(`https://${req.headers.host}${req.url}`)
    }
})
app.use(cors({ credentials: true, origin: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }))
app.use(express.json())
app.use(cookieParser())
app.use("/api", limiter)

const verifyJwt = async (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
        req.user = decoded
    })

    next()

}

//Register a user to the database
app.post("/api/users", async (req, res) => {
    const start = Date.now()
    const { username, password } = req.body

    try {
        const generatedSalt = await bcrypt.genSalt(saltRounds)
        var hashedPass = await bcrypt.hash(password, generatedSalt)
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Hashing failed" })
    }

    try {
        const result = await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hashedPass])
        const token = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, process.env.JWT_SECRET, {
            expiresIn: "12h"
        })
        console.log(`/POST:Registered User - ${Date.now() - start} ms`)
        res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
        return res.status(200).send({ token })

    } catch (err) {
        console.error(err)
        if (err.code === "23505") {
            return res.status(500).send({ message: "Username already exists" })
        }
        return res.status(500).send({ message: "Error adding to the database" })
    }

})

//Get all users
app.get("/api/users", verifyJwt, async (req, res) => {

    const { id } = req.user
    const start = Date.now()

    try {
        const result = await pool.query("SELECT * FROM users")
        const placeholder = result.rows.map(({ id, username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor }) => {
            return { id, username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor }
        })
        console.log(`/GET - ${Date.now() - start} ms`)
        return res.status(200).send(placeholder)
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Error getting all users from database" })
    }

})

//Get specific user
app.get("/api/users/:username", async (req, res) => {

    const username = req.params.username
    const start = Date.now()

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])
        if (result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else {
            const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Error getting user from database" })
    }
})

//Get specific user through token
app.get("/api/admin", verifyJwt, async (req, res) => {

    const { id } = req.user
    const start = Date.now()

    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
        if (result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else {
            const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Error getting user from database" })
    }
})

//Delete specific user
app.delete("/api/users/", verifyJwt, async (req, res) => {

    const start = Date.now()
    const { id } = req.user

    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id])
        if (result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else {
            console.log(`/DELETE - ${Date.now() - start} ms`)
            res.cookie("jwt", "", { maxAge: 0, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
            return res.status(200).send({ message: "User deleted" })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Error deleting user from database" })
    }

})

//Update colors based on what is in the request body
app.put("/api/users/", verifyJwt, async (req, res) => {

    const start = Date.now()
    const { id } = req.user
    const { bgcolor, fontcolor, buttoncolor, tagcolor, avatarbgcolor, avatarfontcolor } = req.body
    const values = []
    let query = "UPDATE users SET "
    let count = 1;

    if (bgcolor) {

        query += "bgcolor = $" + count
        values.push(bgcolor)
        count++
    }
    if (fontcolor) {

        if (count > 1) {
            query += ", "
        }

        query += "fontcolor = $" + count
        values.push(fontcolor)
        count++
    }
    if (buttoncolor) {

        if (count > 1) {
            query += ", "
        }

        query += "buttoncolor = $" + count
        values.push(buttoncolor)
        count++
    }
    if (tagcolor) {

        if (count > 1) {
            query += ", "
        }

        query += "tagcolor = $" + count
        values.push(tagcolor)
        count++
    }
    if (avatarbgcolor) {

        if (count > 1) {
            query += ", "
        }

        query += "avatarbgcolor = $" + count
        values.push(avatarbgcolor)
        count++
    }
    if (avatarfontcolor) {

        if (count > 1) {
            query += ", "
        }

        query += "avatarfontcolor = $" + count
        values.push(avatarfontcolor)
        count++
    }

    query += " WHERE id = $" + count + " RETURNING *"
    values.push(id)

    try {
        const result = await pool.query(query, values)
        const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
        console.log(`/PUT - ${Date.now() - start} ms`)
        return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Could not update information on database" })
    }
})

//Update links
app.put("/api/users/links", verifyJwt, async (req, res) => {

    const { id } = req.user
    const { links } = req.body
    const start = Date.now()

    try {
        const result = await pool.query("UPDATE users SET links = $1 WHERE id = $2 RETURNING *", [JSON.stringify(links), id])
        const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
        console.log(`/PUT - ${Date.now() - start} ms`)
        return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: "Could not update links on database" })
    }
})

//Login User
app.post("/api/login", async (req, res) => {

    const { username, password } = req.body
    const start = Date.now()

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])
        if (result.rows.length > 0) {
            const isValid = await bcrypt.compare(password, result.rows[0].password)
            if (isValid) {
                const token = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, process.env.JWT_SECRET, {
                    expiresIn: "12h"
                })
                console.log(`LOGIN - ${Date.now() - start} ms`)
                res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
                return res.status(200).send({ token })
            } else {
                return res.status(401).send({ message: "Not authorized" })
            }
        } else {
            return res.status(401).send({ message: "Not authorized" })
        }
    } catch (err) {
        console.error(err)
        return res.status(401).send({ message: "Not authorized" })
    }
})

//Validate User
app.get("/api/validate", (req, res) => {
    const token = req.cookies.jwt
    const start = Date.now()

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        } else {
            console.log(`VERIFY - ${Date.now() - start} ms`)
            return res.status(200).send(decoded)
        }
    })
})

//Logout User
app.get("/api/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
    res.status(200).send({ message: "Logged out" })
})

https.createServer(options, app).listen(443)
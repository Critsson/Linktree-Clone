const express = require("express")
require("dotenv").config({ path: "./.env.local" })
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const rateLimit = require("express-rate-limit")
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

app.use(cors({ credentials: true, origin: "http://localhost:3000" }))
app.use(express.json())
app.use(cookieParser())
app.use("/api", limiter)

app.get("/test", (req, res) => {
    return res.send({message: "Hello!"})
})

//Register a user to the database
app.post("/api/users", async (req, res) => {
    const start = Date.now()
    const { username, password } = req.body
    await bcrypt.genSalt(saltRounds, async (err, salt) => {
        if (err) {
            console.error(err)
            return res.status(500).send({ message: "Salt gen failed" })
        } else {
            await bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    console.error(err)
                    return res.status(500).send({ message: "Hashing failed" })
                } else {
                    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hash], (error, result) => {
                        if (error && error.code === "23505") {
                            console.error(error)
                            return res.status(500).send({ message: "Username already exists" })
                        }
                        else if (error) {
                            console.error(error)
                            return res.status(500).send({ message: "Error adding to the database" })
                        } else {
                            const token = jwt.sign({ username: result.rows[0].username }, process.env.JWT_SECRET, {
                                expiresIn: "12h"
                            })
                            console.log(`/POST:Registered User - ${Date.now() - start} ms`)
                            res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true })
                            return res.status(200).send({ token })
                        }
                    })
                }
            })
        }
    }
    )
})

//Get all users
app.get("/api/users", async (req, res) => {
 
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
    })

    const start = Date.now()
    await pool.query("SELECT * FROM users", (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Error getting all users from database" })
        } else {
            const placeholder = result.rows.map(({username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor}) => {
                return {username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor}
            })
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send(placeholder)
        }
    })
})

//Get specific user
app.get("/api/users/:username", async (req, res) => {

    const username = req.params.username
    const start = Date.now()

    await pool.query("SELECT * FROM users WHERE username = $1", [username], (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Error getting user from database" })
        } else if (result && result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else if (result && result.rows[0].links) {
            const {username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor} = result.rows[0]
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send({username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor})
        } else {
            console.log(`/GET - ${Date.now() - start} ms`)
            const {username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor} = result.rows[0]
            return res.status(200).send({username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor})
        }
    })
})

//Delete specific user
app.delete("/api/users/:username", async (req, res) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
    })
    const username = req.params.username
    const start = Date.now()

    await pool.query("DELETE FROM users WHERE username = $1 RETURNING *", [username], (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Error deleting user from database" })
        } else if (result && result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else {
            console.log(`/DELETE - ${Date.now() - start} ms`)
            return res.status(200).send(result.rows)
        }
    })
})

//Update colors based on what is in the request body
app.put("/api/users/:username", (req, res) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
    })
    const username = req.params.username
    const { bgcolor, fontcolor, buttoncolor, tagcolor, avatarbgcolor, avatarfontcolor } = req.body
    const start = Date.now()
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

    query += " WHERE username = $" + count + " RETURNING *"
    values.push(username)

    pool.query(query, values, (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Could not update information on database" })
        } else {
            console.log(`/PUT - ${Date.now() - start} ms`)
            return res.status(200).send(result.rows)
        }
    })

})

//Update links
app.put("/api/users/:username/links", (req, res) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
    })
    const username = req.params.username
    const { links } = req.body
    const start = Date.now()

    pool.query("UPDATE users SET links = $1 WHERE username = $2 RETURNING *", [JSON.stringify(links), username], (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Could not update links on database" })
        } else {
            console.log(`/PUT - ${Date.now() - start} ms`)
            return res.status(200).send(result.rows)
        }
    })
})

//Login User
app.post("/api/login", (req, res) => {

    const { username, password } = req.body
    const start = Date.now()

    pool.query("SELECT * from users WHERE username = $1", [username], async (error, result) => {
        if (error) {
            console.error(error)
            return res.status(401).send({ message: "Not authorized" })
        } else if (result.rows.length > 0) {
            const isValid = await bcrypt.compare(password, result.rows[0].password)
            if (isValid) {
                const token = jwt.sign({ username: result.rows[0].username }, process.env.JWT_SECRET, {
                    expiresIn: "12h"
                })
                console.log(`${Date.now() - start} ms`)
                res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true })
                return res.status(200).send({ token })
            } else {
                return res.status(401).send({ message: "Not authorized" })
            }
        } else {
            return res.status(401).send({ message: "Not authorized" })
        }
    })
})

//Validate User
app.get("/api/validate", (req, res) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        } else {
            return res.status(200).send(decoded)
        }
    })
})

//Logout User
app.get("/api/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).send({ message: "Logged out" })
})

app.listen(5000, () => {
    console.log("Listening on port 5000...")
})
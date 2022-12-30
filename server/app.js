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
                            // is "chainlink.restapi.ca" a development url you're using? it's usually best to use a local only hostname for local development
                            // you should probably use a local only domain so you can set the domain to be "chainlink.local" and browsers should send it to any domains that match "chainlink.local" regardless of port or subdomain as long as you specify the domain.
                            // you need to update your local hosts file so that it knows to send requests to those hostnames to your local server. https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/
                            // you would simply list add
                            // localhost:3000   chainlink.local

                            // i think you can keep it to localhost as well since ports are ignored for cookies as long as the domains match. https://stackoverflow.com/questions/18492576/share-cookies-between-subdomain-and-domain
                            res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
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
    // should a user really be able to list all users? maybe this is just for testing
    const start = Date.now()
    await pool.query("SELECT * FROM users", (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Error getting all users from database" })
        } else {
            const placeholder = result.rows.map(({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor }) => {
                return { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor }
            })
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send(placeholder)
        }
    })
})

//Get specific user
// generally you use the id for resource identifiers /api/users/:userId
// also need to verify jwt and use the correct user only
app.get("/api/users/:username", async (req, res) => {

    const username = req.params.username
    const start = Date.now()

    // if you use a callback here there's no need to await since it does not return a Promise. if you want to use await then you use the result of the call to pool.query
    // const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    await pool.query("SELECT * FROM users WHERE username = $1", [username], (error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send({ message: "Error getting user from database" })
        } else if (result && result.rows.length === 0) {
            return res.status(500).send({ message: "User does not exist" })
        } else if (result && result.rows[0].links) {
            const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
            console.log(`/GET - ${Date.now() - start} ms`)
            return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
        } else {
            console.log(`/GET - ${Date.now() - start} ms`)
            const { username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor } = result.rows[0]
            return res.status(200).send({ username, links, bgcolor, fontcolor, buttoncolor, tagcolor, avatarfontcolor, avatarbgcolor })
        }
    })
})

//Delete specific user
app.delete("/api/users/", async (req, res) => {
    const token = req.cookies.jwt
    const start = Date.now()

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }

    // almost all of your routes will need this so you should separate out all the routes that require authentication and create a "verify jwt" middleware for all those routes
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        } else {
            pool.query("DELETE FROM users WHERE username = $1 RETURNING *", [decoded.username], (error, result) => {
                if (error) {
                    console.error(error)
                    return res.status(500).send({ message: "Error deleting user from database" })
                } else if (result && result.rows.length === 0) {
                    return res.status(500).send({ message: "User does not exist" })
                } else {
                    console.log(`/DELETE - ${Date.now() - start} ms`)
                    res.cookie("jwt", "", { maxAge: 0, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
                    return res.status(200).send(result.rows)
                }
            })
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
    // you should take a look at an orm to make it easier to manage schema and write SQL queries
    // sequalize, knex, typeorm and prisma are good examples
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
    // verify has a overload for this function that returns a promise so you can await this if you want. you want to generally stick to one style of either using awaits or no awaits
    // const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
    })
    // scope to the user in the jwt
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
                console.log(`LOGIN - ${Date.now() - start} ms`)
                res.cookie("jwt", token, { maxAge: 43200000, httpOnly: true, secure: true, domain: "chainlink.restapi.ca", sameSite: "none" })
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
    console.log(req.cookies.jwt)
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
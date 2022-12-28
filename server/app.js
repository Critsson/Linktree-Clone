const express = require("express")
require("dotenv").config({ path: "./.env.local" })
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const app = express();
const saltRounds = 12;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

app.use(cors())
app.use(express.json())


//Register a user to the database
app.post("/api/users", async (req, res) => {
    const start = Date.now()
    const { username, password } = req.body
    await bcrypt.genSalt(saltRounds, async (err, salt) => {
        if (err) {
            console.error(err)
            res.status(500).send({ message: "Salt gen failed" })
        } else {
            await bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    console.error(err)
                    res.status(500).send({ message: "Hashing failed" })
                } else {
                    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hash], (error, result) => {
                        if (error && error.code === "23505") {
                            console.error(error)
                            res.status(500).send({ message: "Username already exists" })
                        }
                        else if (error) {
                            console.error(error)
                            res.status(500).send({ message: "Error adding to the database" })
                        } else {
                            console.log(`/POST - ${Date.now() - start} ms`)
                            res.status(200).send(result.rows)
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
    const start = Date.now()
    await pool.query("SELECT * FROM users", (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Error getting all users from database" })
        } else {
            console.log(`/GET - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
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
            res.status(500).send({ message: "Error getting user from database" })
        } else if (result && result.rows.length === 0) {
            res.status(500).send({ message: "User does not exist" })
        } else if (result && result.rows[0].links) {
            console.log(`/GET - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
        } else {
            console.log(`/GET - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
        }
    })
})

//Delete specific user
app.delete("/api/users/:username", async (req, res) => {
    const username = req.params.username
    const start = Date.now()

    await pool.query("DELETE FROM users WHERE username = $1 RETURNING *", [username], (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Error deleting user from database" })
        } else if (result && result.rows.length === 0) {
            res.status(500).send({ message: "User does not exist" })
        } else {
            console.log(`/DELETE - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
        }
    })
})

//Update colors based on what is in the request body
app.put("/api/users/:username", (req, res) => {
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
            res.status(500).send({ message: "Could not update information on database" })
        } else {
            console.log(`/PUT - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
        }
    })

})

//Update links
app.put("/api/users/:username/links", (req, res) => {
    const username = req.params.username
    const { links } = req.body
    const start = Date.now()

    pool.query("UPDATE users SET links = $1 WHERE username = $2 RETURNING *", [JSON.stringify(links), username], (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Could not update links on database" })
        } else {
            console.log(`/PUT - ${Date.now() - start} ms`)
            res.status(200).send(result.rows)
        }
    })
})

//Authenticate User
app.post("/api/login", (req, res) => {

    const { username, password } = req.body
    const start = Date.now()

    pool.query("SELECT * from users WHERE username = $1", [username], async (error, result) => {
        if (error) {
            console.error(error)
            res.status(401).send({ message: "Not authorized" })
        } else if (result.rows.length > 0) {
            const isValid = await bcrypt.compare(password, result.rows[0].password)
            if (isValid) {
                console.log(`${Date.now() - start} ms`)
                res.status(200).send({ id: result.rows[0].id, username: result.rows[0].username })
            } else {
                res.status(401).send({ message: "Not authorized" })
            }
        } else {
            res.status(401).send({ message: "Not authorized" })
        }
    })
})

app.listen(5000, () => {
    console.log("Listening on port 5000...")
})
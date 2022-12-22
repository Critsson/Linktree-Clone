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
app.post("/users", async (req, res) => {
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
                    await pool.query("INSERT INTO users (username, password, bgcolor, fontcolor, buttoncolor) VALUES ($1, $2, $3, $4, $5) RETURNING *", [username, hash, "ffffff", "1c1c1c", "2bff00"], (error, result) => {
                        if (error && error.code === "23505") {
                            console.error(error)
                            res.status(500).send({ message: "Username already exists" })
                        }
                        else if (error) {
                            console.error(error)
                            res.status(500).send({ message: "Error adding to the database" })
                        } else {
                            res.status(200).send(result)
                        }
                    })
                }
            })
        }
    }
    )
})

//Get all users
app.get("/users", async (req, res) => {
    await pool.query("SELECT * FROM users", (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Error getting all users from database" })
        } else {
            res.status(200).send(result)
        }
    })
})

//Get specific user
app.get("/users/:username", async (req, res) => {
    const username = req.params.username

    await pool.query("SELECT * FROM users WHERE username = $1", [username], (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Error getting user from database" })
        } else if (result && result.rows.length === 0) {
            res.status(500).send({ message: "User does not exist" })
        } else {
            res.status(200).send(result)
        }
    })
})

//Delete specific user
app.delete("/users/:username", async (req, res) => {
    const username = req.params.username

    await pool.query("DELETE FROM users WHERE username = $1 RETURNING *", [username], (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Error deleting user from database" })
        } else if (result && result.rows.length === 0) {
            res.status(500).send({ message: "User does not exist" })
        } else {
            res.status(200).send(result)
        }
    })
})

//Update colors based on what is in the request body
app.put("/users/:username", (req, res) => {
    const username = req.params.username
    const { bgcolor, fontcolor, buttoncolor } = req.body
    const values = []
    let query = "UPDATE users SET "
    let count = 1;

    if (bgcolor) {

        if (count > 1) {
            query += ", "
        }

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

    query += " WHERE username = $" + count + " RETURNING *"
    values.push(username)

    pool.query(query, values, (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).send({ message: "Could not update information on database" })
        } else {
            res.status(200).send(result)
        }
    })

})

app.listen(5000, () => {
    console.log("Listening on port 5000...")
})
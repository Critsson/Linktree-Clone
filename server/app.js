const express = require("express")
require("dotenv").config({path: "./.env.local"})
const cors = require("cors")
const {Pool} = require("pg")
const app = express();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

console.log(process.env.DB_PASS)

app.use(cors())

app.listen(5000, () => {
    console.log("Listening on port 5000...")
})
CREATE DATABASE linktree_clone_db;

CREATE TABLE credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    links TEXT,
    bgcolor CHAR(6) NOT NULL,
    fontcolor CHAR(6) NOT NULL,
    buttoncolor CHAR(6) NOT NULL
);
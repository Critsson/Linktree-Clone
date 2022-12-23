CREATE DATABASE linktree_clone_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    links jsonb,
    bgcolor CHAR(6) NOT NULL,
    fontcolor CHAR(6) NOT NULL,
    buttoncolor CHAR(6) NOT NULL
);
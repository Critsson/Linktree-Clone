CREATE DATABASE linktree_clone_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    links jsonb,
    bgcolor CHAR(6) NOT NULL DEFAULT 'ffffff',
    fontcolor CHAR(6) NOT NULL DEFAULT 'ffffff',
    buttoncolor CHAR(6) NOT NULL DEFAULT '202843',
    tagcolor CHAR(6) NOT NULL DEFAULT '202843',
    avatarfontcolor CHAR(6) NOT NULL DEFAULT 'ffffff',
    avatarbgcolor CHAR(6) NOT NULL DEFAULT '202843'
);
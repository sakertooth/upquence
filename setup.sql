CREATE DATABASE upquence;
\c upquence;

CREATE TABLE levels (
    id      SERIAL PRIMARY KEY,
    data    JSONB NOT NULL
);
CREATE DATABASE upquence;
\c upquence;

CREATE TABLE levels (
    id      SERIAL AUTO_INCREMENT PRIMARY KEY,
    data    JSONB NOT NULL
);
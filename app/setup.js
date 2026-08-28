const easyLevel = require("./levels/easy.json");
const mediumLevel = require("./levels/medium.json");
const hardLevel = require("./levels/hard.json");
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const setupSql = fs.readFileSync(
    path.join(__dirname, "setup.sql"),
    "utf8"
);

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

(async () => {
    try {
        await client.connect();
        await client.query(setupSql);

        await client.query(`TRUNCATE levels RESTART IDENTITY`);
        await client.query(`INSERT INTO levels (data) VALUES ($1)`, [easyLevel]);
        await client.query(`INSERT INTO levels (data) VALUES ($1)`, [mediumLevel]);
        await client.query(`INSERT INTO levels (data) VALUES ($1)`, [hardLevel]);

        console.log("Database setup complete");
    }
    finally {
        await client.end();
    }
})();

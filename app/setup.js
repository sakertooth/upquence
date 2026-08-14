const easyLevel = require("./levels/easy.json");
const mediumLevel = require("./levels/medium.json");
const hardLevel = require("./levels/hard.json");

const { Pool } = require("pg");
const pool = new Pool(require("../env.json"));

(async () => {
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [easyLevel]);
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [mediumLevel]);
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [hardLevel]);
    await pool.end();
})();

const { Pool } = require("pg");
const pool = new Pool(require("../env.json"));

const easyLevel = require("./levels/easy.json");
const mediumLevel = require("./levels/medium.json");
const hardLevel = require("./levels/hard.json");

(async () => {
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [easyLevel]);
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [mediumLevel]);
    await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [hardLevel]);
})();

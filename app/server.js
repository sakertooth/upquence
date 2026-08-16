let express = require("express");

let app = express();
let hostname = "localhost";
let port = 3000;

let env = require("../env.json");

let { Pool } = require("pg");
let pool = new Pool(env);

(async () => {
  await pool.connect();
  console.log("Connected to the database");
})();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/levels", async (req, res) => {
  try {
    const response = await pool.query(`SELECT id, data FROM levels`);
    res.json({ levels: response.rows.map(row => ({ ...row.data, id: row.id })) });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.json({ error: "Something went wrong" });
  }
});

app.get("/api/levels/:id", async (req, res) => {
  try {
    const response = await pool.query(`SELECT data FROM levels WHERE id = $1`, [req.query.id]);
    res.json({ levels: response.rows });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.json({ error: "Something went wrong" });
  }
});

app.post("/api/levels/add", async (req, res) => {
  try {
    const response = await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [req.body]);
    res.json({ message: "Level added!" });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.json({ error: "Something went wrong" });
  }
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

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

app.post("/api/sessions", async (req, res) => {
  try {
    const result = await pool.query(`INSERT INTO sessions (data) VALUES ($1) RETURNING id`, [req.body]);
    res.json({ message: "Session saved!", id: result.rows[0].sid });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.json({ error: "Something went wrong" });
  }
});

app.get("/api/sessions/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(`SELECT data FROM sessions WHERE id = ($1)`, [id]);

    if (result.rows.length === 0) {
      res.status(500).json({ error: `No session was found for the id ${id}` });
      return;
    }

    return res.json(result.rows[0].data);
  }
  catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong" })
  }
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

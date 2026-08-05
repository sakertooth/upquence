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
    const response = await pool.query(`SELECT data FROM levels`);
    res.json({ levels: response.rows });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: "Something went wrong" });
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
    res.send({ error: "Something went wrong" });
  }
});

app.post("/api/levels/:id/submit", async (req, res) => {
  if (!req.body.hasOwnProperty("submission")) {
    res.status(400);
    res.send({ error: "Missing submission" })
    return;
  }

  try {
    const response = await pool.query(`SELECT data FROM levels WHERE ID = $1`, [req.query.id]);
    const level = response.rows[0];
    const submission = req.body.submission;

    let matches = 0;
    let totalMatches = level.pattern.length * level.pattern[0].steps;

    for (let trackIndex = 0; trackIndex < level.pattern.length; ++trackIndex) {
      const levelTrack = submission.pattern[trackIndex];
      const submissionTrack = submission.pattern[trackIndex];
      for (let stepIndex = 0; stepIndex < levelTrack.steps.length; ++stepIndex) {
        if (submissionTrack.steps[stepIndex] === levelTrack.steps[stepIndex]) {
          ++matches;
        }
      }
    }

    const score = matches / totalMatches * 100;
    res.json({ score: score });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: "Something went wrong" });
  }
});

app.post("/api/levels/:id/add", async (req, res) => {
    if (!req.body.hasOwnProperty("level")) {
    res.status(400);
    res.send({ error: "Missing level" })
    return;
  }

  try {
    const response = await pool.query(`INSERT INTO levels (data) VALUES ($1)`, [req.body.level]);
    res.json({ message: "Level added" });
  }
  catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: "Something went wrong" });
  }
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

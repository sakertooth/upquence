let express = require("express");
let multer = require("multer");
let path = require("path");

let app = express();
let hostname = process.env.HOSTNAME;
let port = process.env.PORT;

let { Pool } = require("pg");
let pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  await pool.connect();
  console.log("Connected to the database");
})();

const uploadSound = multer({
  storage: multer.diskStorage({
    filename: (_, file, cb) => cb(null, `${generateRandomIdentifier()}${path.extname(file.originalname)}`),
    destination: (_, _, cb) => cb(null, "sounds")
  })
});

function generateRandomIdentifier() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

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
    res.jsozn({ levels: response.rows });
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
    res.json({ message: "Session saved!", id: result.rows[0].id });
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

app.post("/api/sounds", uploadSound.single("file"), (req, res) => {
  const filename = req.file.filename;
  const extension = path.extname(filename);

  const sound = {
    id: path.basename(filename, extension),
    name: path.basename(req.file.originalname, path.extname(req.file.originalname)),
    url: `/sounds/${filename}`
  };

  res.status(201).json(sound);
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

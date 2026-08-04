let express = require("express");
let app = express();
let hostname = "localhost";
let port = 3000;
let env = require("../env.json");
let pool = new Pool(env);

(async () => {
  await pool.connect();
  console.log("Connected to the database");
})();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/levels", (req, res) => {
  res.send();
});

app.get("/api/levels/:id", (req, res) => {
  res.send();
});

app.post("/api/levels/:id/submit", (req, res) => {
  res.send();
});

app.post("/api/levels/:id/add", (req, res) => {
  res.send();
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

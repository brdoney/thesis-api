const path = require("node:path");
const express = require("express");

const db = require("better-sqlite3")("linkdata.db", { fileMustExist: true });
db.pragma("journal_mode = WAL");
const insert_stmt = db.prepare(
  "INSERT INTO clicks VALUES (@to, @postId, @userId)",
);

const app = express();
const PORT = 9100;

app.use(express.json());
app.use(express.static("public"));

app.get("/", async (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/click", (req, res) => {
  const data = req.body;
  insert_stmt.run(data);
  console.log(`${data.userId} clicked ${data.postId}, ${data.to}`);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

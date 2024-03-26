import path from "node:path";
import express from "express";
import { maxMapId, readMap, writeMap } from "./user-map.js";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import "dotenv/config";
import { checkAuth } from "./auth.js";

const db = new Database("linkdata.db", { fileMustExist: true });
db.pragma("journal_mode = WAL");
const insertStmt = db.prepare(
  "INSERT INTO clicks VALUES (@to, @postId, @userId)",
);

const app = express();
const PORT = 9100;

const USER_MAP = "./user-map.json";
const userMap = await readMap(USER_MAP);
let maxId = maxMapId(userMap);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function haveConsent(userId) {
  return userId in userMap;
}

app.post("/api/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    res.sendStatus(401);
  }

  const data = req.body;
  if (!data.consent && haveConsent(auth.username)) {
    // TODO: Revoking consent; delete all data
  }

  // Commit their consent status
  maxId++;
  userMap.set(auth.username, maxId);

  await writeMap(USER_MAP);
});

app.post("/api/click", (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    res.sendStatus(401);
  } else if (!haveConsent(auth.username)) {
    res.sendStatus(403);
  }

  const userId = userMap.get(auth.username);
  if (userId) {
    // They gave consent, so log their click
    const data = req.body;
    insertStmt.run({ userId, ...data });
    console.log(`${data.userId} clicked ${data.postId}, ${data.to}`);
  } else {
    console.log(`Anonymous click`);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

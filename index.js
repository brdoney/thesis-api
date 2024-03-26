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

// __dirname for es modules -- from
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules
const __dirname = import.meta.dirname;

app.get("/", (_req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

function haveConsent(userId) {
  return userId in userMap;
}

app.get("/consent", async (_, res) => {
  // TODO: Show current consent status on page
  return res.sendFile(path.join(__dirname, "public", "consent.html"));
});

app.post("/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const data = req.body;
  if (data.consent) {
    // Commit their consent status
    maxId++;
    userMap.set(auth.username, maxId);
    await writeMap(USER_MAP);
    console.log(`${auth.username} gave consent`);
  } else {
    const hadConsent = haveConsent(auth.username);

    // Denying consent
    userMap.delete(auth.username);
    await writeMap(USER_MAP);

    if (hadConsent) {
      // TODO: Revoking consent - delete all past data
      console.log(`${auth.username} revoked consent`);
    } else {
      console.log(`${auth.username} denied consent`);
    }
  }

  return res.redirect(303, "/confirmed.html")
});

app.post("/click", (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  } else if (!haveConsent(auth.username)) {
    return res.sendStatus(403);
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

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

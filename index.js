import { maxMapId, readMap, writeMap } from "./user-map.js";
import { checkAuth } from "./auth.js";

import express from "express";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import "dotenv/config";

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

function haveConsent(userId) {
  return userMap.has(userId);
}

app.get("/consent", async (req, res) => {
  // TODO: Show current consent status on page
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  // Send consent value, or null if we don't have it yet
  if (haveConsent(auth.username)) {
    return res.json({ consent: userMap.get(auth.username) });
  }
  return res.json(null);
});

app.post("/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const { consent } = req.body;

  if (consent === "Yes") {
    // Commit their consent status
    maxId++;
    userMap.set(auth.username, maxId);
    await writeMap(USER_MAP, userMap);
    console.log(`${auth.username} gave consent`);
  } else if (consent === "No") {
    const hadConsent = haveConsent(auth.username);

    // Denying consent
    userMap.set(auth.username, null);
    await writeMap(USER_MAP, userMap);

    if (hadConsent) {
      // TODO: Revoking consent - delete all past data
      console.log(`${auth.username} revoked consent`);
    } else {
      console.log(`${auth.username} denied consent`);
    }
  } else {
    return res.sendStatus(400);
  }

  return res.redirect(303, "/cs3214/test/confirmed.html");
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
    console.log(`${auth.username} clicked ${data.postId}, ${data.to}`);
  } else {
    console.log(`Anonymous click`);
  }

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

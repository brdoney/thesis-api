import { checkAuth } from "./auth.js";
import { addUser, getUser } from "./consent.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Database from "better-sqlite3";
import "dotenv/config";

const db = new Database("linkdata.db", { fileMustExist: true });
db.pragma("journal_mode = WAL");
const insertStmt = db.prepare(
  "INSERT INTO clicks VALUES (@to, @postId, @userId)",
);

const app = express();
const PORT = 9100;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("frontend/build"));

app.get("/consent", async (req, res) => {
  // TODO: Show current consent status on page
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const user = getUser(db, { pid: auth.username });

  // Send consent value, or null if we don't have it yet
  if (user) {
    return res.json({ consent: user.consent });
  }
  return res.json(null);
});

app.post("/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const { consent, discordId } = req.body;

  console.log(consent, discordId);
  if (!consent || !discordId) {
    res.status(400).send("Missing one or more expected URL-encoded parameters");
  }

  if (consent === "Yes") {
    // Commit their consent status
    addUser(db, auth.username, discordId, true);
    console.log(`${auth.username} gave consent`);
  } else if (consent === "No") {
    // Add or update their status
    addUser(db, auth.username, discordId, false);
    console.log(`${auth.username} denied consent`);
  } else {
    return res.sendStatus(400);
  }

  return res.redirect(303, "/cs3214/test/confirmed.html");
});

app.post("/click", (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const user = getUser(db, { pid: auth.username });
  if (!user) {
    return res.sendStatus(403);
  }

  if (user.consent) {
    // They gave consent, so log their click
    const data = req.body;
    insertStmt.run({ userId: user.userId, ...data });
    console.log(`${auth.username} clicked ${data.postId}, ${data.to}`);
  } else {
    console.log(`Anonymous click`);
  }

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

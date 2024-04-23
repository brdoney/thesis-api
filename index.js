import { checkAuth } from "./auth.js";
import { addUser, getUser } from "./consent.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Database from "better-sqlite3";
import "dotenv/config";
import { logClick } from "./click.js";

const db = new Database("linkdata.db", { fileMustExist: true });
// We're sharing the file over a network FS, so we can't use WAL
// db.pragma("journal_mode = WAL");
// Enable foreign keys so deletes can cascade
db.pragma("foreign_keys = ON");

const app = express();
const PORT = 9100;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("frontend/build"));
app.use("/manpdfs", express.static("manpdfs"));
app.use("/irb", express.static("irb"));

app.get("/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const user = getUser(db, { pid: auth.username });

  // Send consent value, or null if we don't have it yet
  const consent = user != null ? user.consent : null;
  return res.json({ consent, ...auth });
});

app.post("/consent", async (req, res) => {
  const auth = checkAuth(req);
  if (!auth) {
    return res.sendStatus(401);
  }

  const { consent, discordId } = req.body;

  if (!consent || !discordId) {
    res.status(400).send("Missing one or more expected URL-encoded parameters");
  }

  if (consent === "Yes") {
    // Commit their consent status
    addUser(db, auth.username, discordId, true);
  } else if (consent === "No") {
    // Add or update their status
    addUser(db, auth.username, discordId, false);
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

    // postId will be `null` if link comes from a post generated
    // by a user who denied consent
    const { postId, to } = data;
    logClick(db, user, to, postId);

    if (postId !== null) {
      console.log(`Click on ${postId}, ${to}`);
    } else {
      console.log(`Click on anonymous post, ${to}`);
    }
  } else {
    console.log("Anonymous click");
  }

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Link click logger is running on port ${PORT}`);
});

import { UserInfo } from "./consent.js";

import Database from "better-sqlite3";

/**
 * Logs click data for user.
 * @param {Database.Database} db the database to add data to
 * @param {UserInfo} user the user who clicked the link
 * @param {string} to the link the user is going to
 * @param {number | null} postId the post the user is coming from, if any
 */
export function logClick(db, user, to, postId) {
  let stmt;
  if (postId !== null) {
    stmt =
      "INSERT INTO clicks (link, post_id, user_id) VALUES (@to, @postId, @userId)";
  } else {
    stmt = "INSERT INTO clicks (link, user_id) VALUES (@to, @userId)";
  }
  const data = { to, postId, userId: user.userId };
  db.prepare(stmt).run(data);
}

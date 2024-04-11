import Database from "better-sqlite3";

class UserInfo {
  /**
   * Create a UserInfo instance.
   * @param {object} user the user's info
   * @param {number} user.rowid the ID of the user
   * @param {string} user.pid the PID of the user
   * @param {string} user.discord_id the Discord ID of the user
   * @param {boolean} user.consent whether the user has given (`true`) or denied (`false`) consent
   */
  constructor({ rowid, pid, discord_id, consent }) {
    this.userId = rowid;
    this.pid = pid;
    this.discordId = discord_id;
    this.consent = consent;
    console.log(consent);
  }
}

/**
 * Get a user's information from their PID or Discord ID.
 * @param {Database.Database} db the database to get info from
 * @param {object} user the user to check
 * @param {string|undefined} user.pid the PID of the user
 * @param {string|undefined} user.discordId the Discord ID of the user
 * @returns {UserInfo|null} the user's information or `null` if they don't exist
 */
export function getUser(db, { pid, discordId }) {
  let stmt, data;
  if (pid !== undefined) {
    stmt = db.prepare("SELECT * FROM consent WHERE pid = ? LIMIT 1");
    data = pid;
  } else if (discordId !== undefined) {
    stmt = db.prepare("SELECT * FROM consent WHERE discord_id = ? LIMIT 1");
    data = discordId;
  } else {
    throw new Error("Must supply PID or Discord ID");
  }

  const res = stmt.get(data);
  if (!res) {
    return null;
  }

  // Convert sqlite bool keywords to real boolean
  res.consent = res.consent == "TRUE";

  return new UserInfo(res);
}

/**
 * Delete all click data for the given user.
 * @param {Database.Database} db database to delete click data from
 * @param {number} userId the ID of the user
 */
function deleteClickData(db, userId) {
  const stmt = db.prepare("DELETE * FROM clicks WHERE user_id = ?");
  const res = stmt.run(userId);
  console.log(res);
}

/**
 * Adds or updates user in the database. Updates occur if PID and/or discord ID are already in the database.
 * @param {Database.Database} db the database to add the user to
 * @param {string} pid the PID of the user
 * @param {string} discordId the Discord ID of the user
 * @param {boolean} consent whether the user has granted consent
 */
export function addUser(db, pid, discordId, consent) {
  const prev = getUser(db, { pid });

  if (prev && !consent) {
    // Revoking consent, so delete old data
    console.log(`Clearing data for ${pid} after revoking consent`);
    deleteClickData(db, prev.userId);
  }

  const convertedConsent = consent ? "TRUE" : "FALSE"
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO consent VALUES (@pid, @discordId, @consent)",
  );
  const res = stmt.run({ pid, discordId, consent: convertedConsent });
  console.log(res);
}

/**
 * Deletes the user from the database. Note that this does not delete their associated click data.
 * @param {Database.Database} db the database to delete the user from
 * @param {string} pid the PID of the user
 */
export function deleteUser(db, pid) {
  const stmt = db.prepare("DELETE FROM consent WHERE pid = ?");
  const res = stmt.run(pid);
  console.log(res);
}

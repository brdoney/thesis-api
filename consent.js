import Database from "better-sqlite3";

class UserInfo {
  /**
   * Create a UserInfo instance.
   * @param {object} user the user's info
   * @param {number} user.id the ID of the user
   * @param {string} user.pid the PID of the user
   * @param {string} user.discord_id the Discord ID of the user
   * @param {boolean} user.consent whether the user has given (`true`) or denied (`false`) consent
   */
  constructor({ id, pid, discord_id, consent }) {
    this.userId = id;
    this.pid = pid;
    this.discordId = discord_id;
    this.consent = consent;
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
    stmt = db.prepare("SELECT * FROM users WHERE pid = ? LIMIT 1");
    data = pid;
  } else if (discordId !== undefined) {
    stmt = db.prepare("SELECT * FROM users WHERE discord_id = ? LIMIT 1");
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
    console.log(`Clearing data after revoking consent`);
    deleteUser(db, prev);
  }

  const consent_stmt = db.prepare(
    "INSERT OR REPLACE INTO users (pid, discord_id, consent) VALUES (@pid, @discordId, @consent)",
  );
  const grading_stmt = db.prepare(
    "INSERT OR IGNORE INTO grading (pid) VALUES (@pid)",
  );

  // Transaction so we don't have partial users
  const doAdd = db.transaction((user) => {
    try {
      const consent_res = consent_stmt.run(user);
      const grading_res = grading_stmt.run(user);
      console.log(`Added user: ${consent_res} ${grading_res}`);
    } catch (err) {
      console.log("error", err);
      if (!db.inTransaction) {
        // Transaction was forcefully rolled back
        console.log("Unable to register or update user");
      }
      throw err; // Finish aborting transaction
    }
  });

  const convertedConsent = consent ? "TRUE" : "FALSE";
  doAdd({ pid, discordId, consent: convertedConsent });
}

/**
 * Deletes the user from the database. Note that this *also* deletes their associated data.
 * @param {Database.Database} db the database to delete the user from
 * @param {UserInfo} user the user to delete
 */
export function deleteUser(db, user) {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  const res = stmt.run(user.userId);
  console.log(`Deleted user ${user.userId}: ${res}`);
}

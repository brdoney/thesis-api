import { TimedSerializer } from "itsdangerous.js";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Request } from "express";

/**
 * Decodes a cookie value set by Flask, since it uses non-standard escapes, octal values, etc.
 * Adapted from https://stackoverflow.com/a/22269965
 * @param {string} val the cookie value to decode
 * @returns {string} the decoded version of the cookie
 */
function decodeFlaskCookie(val) {
  if (val.indexOf("\\") === -1) {
    return val; // not encoded
  }

  // Get rid of surrounding ", if any
  if (val.indexOf('\\"') === 0) {
    val = val.slice(1, -1);
  }

  // Get rid of escaped \"
  val = val.replace(/\\"/g, '"');

  // Convert octal escape codes
  val = val.replace(/\\(\d{3})/g, (_, octal) =>
    String.fromCharCode(parseInt(octal, 8)),
  );

  return val.replace(/\\\\/g, "\\");
}

/**
 * Check the digest portion of the Flask, where a cookie value looks like `payload|digest`.
 * @param {any} payload the payload to check (part before the '|')
 * @param {any} digest digest of the payload (part after the '|')
 * @returns {boolean} `true` if the payload was not modified since digest was sent, `false` otherwise
 */
function checkDigest(payload, digest) {
  const hmac = createHmac("sha512", process.env.SECRET_KEY);

  // Flask does same conversion, so just to be safe
  hmac.update(Buffer.from(payload, "ascii").toString("utf-8"));

  return timingSafeEqual(Buffer.from(digest), Buffer.from(hmac.digest("hex")));
}

/**
 * Check if a given request is authenticated based on its cookie value.
 * @param {Request} req the request we are interested in
 * @returns {boolean} `true` if properly authenticated, `false` otherwise
 */
export function checkAuth(req) {
  if (process.env.COOKIE_NAME in req.cookies) {
    let authToken = decodeFlaskCookie(req.cookies[process.env.COOKIE_NAME]);

    // First half is itsdangerous payload, second half is flask-login HMAC
    let [payload, digest] = authToken.split("|");

    if (!checkDigest(payload, digest)) {
      console.log("invalid digest");
      return null;
    }

    const serializer = new TimedSerializer({
      secretKey: process.env.SECRET_KEY,
    });
    const maxAge = 60 * 60 * 24 * 30; // One month

    try {
      // Return the token's payload
      const data = serializer.parse(payload, "token", maxAge);
      return { username: data[0], displayName: data[1] };
    } catch (e) {
      // Invalid or expired token
      return null;
    }
  }

  return null;
}

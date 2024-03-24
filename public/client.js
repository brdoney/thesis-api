const RETRY_TIMEOUT = 5000;
const AUTOGRADER_API =
  "https://courses.cs.vt.edu/cs3214/autograder_api/spring2024";
const DISDOC_API = "https://courses.cs.vt.edu/cs3214/test";

const params = new URLSearchParams(window.location.search);
let to = params.get("to");
let postId = params.get("postid");

function log_click(data) {
  console.log("Logging click");
  return fetch(`${DISDOC_API}/click`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function check_login() {
  try {
    const res = await fetch(`${AUTOGRADER_API}/whoami`);

    // Logged in, so continue with redirect
    const user_info = await res.json();

    await log_click({ to, postId, userId: user_info.name });

    // We want to navigate and remove old link from history
    window.location.replace(to);
  } catch (e) {
    if (e.status !== 403) {
      // Not logged in

      // Make sure we're showing login button
      document.getElementById("login-div").style.display = "inherit";

      // Check again in later
      setTimeout(check_login, RETRY_TIMEOUT);
    }
    return false;
  }
}

if (to === null || postId === null) {
  // Something about the link isn't right
  document.getElementById("invalid-link").style.display = "inherit";
} else {
  // Link was good, check if logged in every 5 seconds until successful
  check_login();
}


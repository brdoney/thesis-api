const DISDOC_API = "https://courses.cs.vt.edu/cs3214/test";
const LOGIN_URL = "http://localhost:3000/cs3214/spring2024/login";

function sendLogClick(to, postId) {
  return fetch(`${DISDOC_API}/click`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, postId }),
  });
}

async function logClick(to, postId) {
  // Try to log click
  const res = await sendLogClick(to, postId);

  if (res.status === 401) {
    // Not logged in - send them to login page (and then back)
    let url = new URL(LOGIN_URL);
    url.searchParams.append("next", encodeURIComponent(window.location.href));
    window.location.replace(url);
  } else if (res.status === 403) {
    // They haven't given consent yet
    document.getElementById("no-consent").style.display = "inherit";
  } else {
    console.log("Success");

    // We want to navigate and remove old link from history
    // window.location.replace(to);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let to = params.get("to");
  let postId = params.get("postid");

  if (to === null || postId === null) {
    // Something about the link isn't right
    document.getElementById("invalid-link").style.display = "inherit";
  } else {
    // Link was good, attempt redirect
    logClick();
  }
});

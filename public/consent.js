const AUTOGRADER_API =
  "https://courses.cs.vt.edu/cs3214/autograder_api/spring2024";
const LOGIN_URL = "http://localhost:3000/cs3214/spring2024/login";

async function verifyAuth() {
  const res = await fetch(`${AUTOGRADER_API}/whoami`);

  if (res.status === 403) {
    // Redirect them to the login page
    window.location.assign(
      `${LOGIN_URL}?next=${encodeURIComponent(window.location.href)}`,
    );
  } else {
    document.getElementById("consent-form").style.display = "inherit";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await verifyAuth();

  const form = document.getElementById("consent-form");
  form.addEventListener("submit", () => {
    form.submit.disabled = true;
    form.submit.value = "Submitting...";
  });
});

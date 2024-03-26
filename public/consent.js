const DISDOC_API = "https://courses.cs.vt.edu/cs3214/test";
const LOGIN_URL = "http://localhost:3000/cs3214/spring2024/login";

async function verifyAuth() {
  const res = await fetch(`${DISDOC_API}/consent`);

  if (res.status === 401) {
    // They're not logged in - redirect them to the login page (and then back)
    window.location.assign(
      `${LOGIN_URL}?next=${encodeURIComponent(window.location.href)}`,
    );
  }

  const json = await res.json();

  const consentStatus = document.getElementById("consent-status");
  if (json === null) {
    consentStatus.textContent = "Not submitted";
  } else if (json.consent === null) {
    consentStatus.textContent = "Denied";
  } else {
    consentStatus.textContent = "Given";
  }

  document.getElementById("consent-form").style.display = "inherit";
}

document.addEventListener("DOMContentLoaded", async () => {
  await verifyAuth();

  document.getElementById("consent-form").addEventListener("submit", (el) => {
    const form = el.target;
    console.log("submitting")
    form.submit.disabled = true;
    form.submit.value = "Submitting...";
  });
});

// place files you want to import through the `$lib` alias in this folder.

const DISDOC_API = 'https://courses.cs.vt.edu/cs3214/test';
// const LOGIN_URL = 'http://localhost:3000/cs3214/spring2024/login';
const LOGIN_URL = 'http://courses.cs.vt.edu/cs3214/spring2024/login';

/**
 * Send a click notice to server.
 * @param {string} to the link we are navigating to
 * @param {string} postId the ID of the post this link was in
 */
export function sendLogClick(to, postId) {
	return fetch(`${DISDOC_API}/click`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ to, postId })
	});
}

export function getConsent() {
	return fetch(`${DISDOC_API}/consent`);
}

/**
 * Redirect to login page and back.
 */
export function login() {
	let url = new URL(LOGIN_URL);
	let current = new URL(window.location.href);

	// Get rid of "/cs3214/" in path
	const path = current.pathname.substring(8);
	const redirected = `../${path}${current.search}`;
	url.searchParams.append('next', redirected);

	window.location.replace(url.href);
}

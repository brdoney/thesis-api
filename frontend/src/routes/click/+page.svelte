<script>
	import { onMount } from 'svelte';
	import { login, sendLogClick } from '$lib/index';

	let invalidLink = false;
	let noConsent = false;

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const to = params.get('to');
		const postId = params.get('postid');

		if (to == null || postId == null) {
			invalidLink = true;
			return;
		}

		// Try to log click
		const res = await sendLogClick(to, postId);

		if (res.status === 401) {
			login();
		} else if (res.status === 403) {
			// They haven't given consent yet
			noConsent = true;
		} else {
			// Success! We want to navigate and remove old link from history
			window.location.replace(to);
		}
	});
</script>

<svelte:head>
	<title>Link Click Logger</title>
</svelte:head>

{#if invalidLink}
	<h3>Invalid Link</h3>
	<p>
		Something about your link was invalid. If you were given this link by the Discord bot, please
		notify Brendan Doney of this issue along with the link: {window.location.href}.
	</p>
{:else if noConsent}
	<h3>No Consent</h3>
	<!-- TODO: Redirect to the consent page -->
	<p>
		You have not indicated your consent status yet. Please do so using the Discord bot and then try
		again. Remember that you can still use the tool, including clicking on links, if you choose to
		deny consent.
	</p>
{/if}

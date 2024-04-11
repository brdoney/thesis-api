<script>
	import { onMount } from 'svelte';
	import { getConsent, login } from '$lib/index';

	let loading = true;
	/** @type {{ consent: boolean, username: string, displayName: string } | null} */
	let consent = null;

	/** @type {{ id: string, nick: string, name: string} | null} */
	let discordInfo = null;
	// Will be undefined until we update discordInfo
	$: usernameString =
		discordInfo?.nick !== discordInfo?.name
			? `${discordInfo?.nick} (${discordInfo?.name})`
			: discordInfo?.name;

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const id = params.get('discordId');
		const nick = params.get('discordNick');
		const name = params.get('discordName');
		if (id != null && nick != null && name != null) {
			discordInfo = { id, nick, name };
		}

		const res = await getConsent();
		if (res.status === 401) {
			login();
			return;
		}

		consent = await res.json();
		loading = false;
	});

	/** @type {string} */
	let consentMsg;
	$: if (consent == null) {
		consentMsg = 'Not submitted';
	} else if (consent.consent) {
		consentMsg = 'Given';
	} else {
		consentMsg = 'Denied';
	}

	let submitting = false;
	function handleSubmit() {
		submitting = true;
	}
</script>

<svelte:head>
	<title>Consent Form</title>
</svelte:head>

<h3>Consent Form</h3>

<p>
	Current consent status: <span id="consent-status">{loading ? 'Loading...' : consentMsg}</span>
</p>

{#if !loading}
	{#if !consent}
		<p>
			Something went wrong while checking your consent status. Please notify Brendan Doney of this
			issue.
		</p>
	{:else if !discordInfo}
		<p>
			Something about your link was invalid. If you were given this link by the Discord bot, please
			notify Brendan Doney of this issue along with the link: {window.location.href}.
		</p>
	{:else}
		<p>Your information:</p>
		<ul>
			<li>PID: <samp>{consent.username}</samp></li>
			<li>Discord Username: <samp>{usernameString}</samp></li>
			<li>Discord ID: <samp>{discordInfo.id}</samp></li>
		</ul>

		<form id="consent-form" method="POST" action="/cs3214/test/consent" on:submit={handleSubmit}>
			<p>
				Please indicate your consent status below if you wish to change it. Remember that you can
				still use the tool even if you choose to deny consent, but we will not collect any data on
				your usage of the tool.
			</p>

			<input type="hidden" name="discordId" value={discordInfo.id} />

			<div class="form-group">
				<label for="yes">
					<input type="radio" id="yes" name="consent" value="Yes" required />
					Yes
				</label>

				<label for="no">
					<input type="radio" id="no" name="consent" value="No" />
					No
				</label>
			</div>

			<input
				type="submit"
				name="submit"
				disabled={submitting}
				value={submitting ? 'Submitting...' : 'Submit'}
			/>
		</form>
	{/if}
{/if}

<style>
	#consent-status {
		text-decoration: underline;
	}

	input[type='submit'] {
		padding: 6px 16px;
		background-color: rgb(85, 108, 214);
		color: white;
		border-radius: 6px;
		border-style: none;
		font-weight: 500;
		font-size: 0.875rem;
	}

	input[type='submit']:disabled {
		background-color: rgba(0, 0, 0, 0.12);
		color: rgba(0, 0, 0, 0.26);
	}

	.form-group {
		margin: 15px 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

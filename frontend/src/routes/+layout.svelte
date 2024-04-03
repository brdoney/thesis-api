<div>
	<slot />
</div>

<style>
	div {
		font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
		font-size: 1.5rem;
	}

	@media only screen and (min-width: 768px) {
		/* Make consent form centred on desktop */
		div {
			margin: 0 25%;
			width: 50%;
		}
	}
</style>

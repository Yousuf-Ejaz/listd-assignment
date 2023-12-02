const fs = require("fs").promises;
const { authenticate } = require("@google-cloud/local-auth");
const {CREDENTIALS_PATH, TOKEN_PATH, SCOPES} = require("../constants");



// Serializes credentials to a file compatible with GoogleAUth.fromJSON.
const saveCredentials = async (client) => {
	// Read the content of the credentials file
	const content = await fs.readFile(CREDENTIALS_PATH);

	// Parse the content as JSON
	const keys = JSON.parse(content);

	// Extract the appropriate key (either "installed" or "web") from the credentials
	const key = keys.installed || keys.web;

	// Prepare a payload with necessary authentication information
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});

	// Write the payload to the token file
	await fs.writeFile(TOKEN_PATH, payload);
};

// Reads previously authorized credentials from the save file.
const loadSavedCredentialsIfExist = async () => {
	try {
		// Attempt to read the content of the token file
		const content = await fs.readFile(TOKEN_PATH);

		// Parse the content as JSON to extract saved credentials
		const credentials = JSON.parse(content);

		// Convert the saved credentials into an OAuth2 client instance
		return google.auth.fromJSON(credentials);
	} catch (err) {
		// If an error occurs (e.g., file not found or invalid JSON), return null
		return null;
	}
};

// Load or request or authorization to call APIs.
const authorize = async () => {
	// Attempt to load saved credentials
	let client = await loadSavedCredentialsIfExist();

	// If saved credentials exist, return the existing OAuth2 client
	if (client) {
		return client;
	}

	// If saved credentials do not exist or are invalid, authenticate the user
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});

	// If authentication is successful, save the obtained credentials
	if (client.credentials) {
		await saveCredentials(client);
	}

	// Return the OAuth2 client for making authenticated requests
	return client;
};

module.exports = authorize;

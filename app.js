const authorize = require("./utilities/auth");
const {
	sendReply,
	createLabel,
	getUnrepliedMessages,
	addLabel,
} = require("./utilities/gmailServices");

const main = async () => {
	// Authorize and obtain an OAuth2 client
	const auth = await authorize();

	// Create a label and obtain its ID
	const labelId = await createLabel(auth);
	console.log(`Label has been created ${labelId}`);

	// Set up an interval to repeat the process
	setInterval(async () => {
		// Get unreplied messages from the inbox
		const messages = await getUnrepliedMessages(auth);
		console.log(`Found ${messages.length} unreplied messages`);

		// Iterate over unreplied messages
		for (const message of messages) {
			try {
				// Attempt to send a reply and add a label to the message
				await sendReply(auth, message);
				console.log(`Sent reply to message with id ${message.id}`);

				await addLabel(auth, message, labelId);
				console.log(`Added label to message with id ${message.id}`);
			} catch (error) {
				// Handle errors during reply sending or label addition
				console.log(error);
				console.log(
					`Failed to send reply to message with id ${message.id}`
				);
				console.log(
					`Failed to add label to message with id ${message.id}`
				);
				console.log("Retrying in 5 seconds...");

				// Wait for 5 seconds before retrying
				await new Promise((resolve) => setTimeout(resolve, 5000));

				// Skip to the next message if the current one fails
				continue;
			}
		}
	}, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
	// Random interval between 45 and 120 seconds
};

main().catch(console.error);

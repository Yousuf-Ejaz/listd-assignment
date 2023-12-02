const { google } = require("googleapis");
const { labelName } = require("../constants");

//Creates a label with the given labelName
const createLabel = async (auth) => {
	console.log("function createlabel got hit ");

	// Create a Gmail API instance using the provided authentication
	const gmail = google.gmail({ version: "v1", auth });

	try {
		// Attempt to create a new label
		const response = await gmail.users.labels.create({
			userId: "me",
			requestBody: {
				name: labelName,
				labelListVisibility: "labelShow",
				messageListVisibility: "show",
			},
		});

		// If label creation is successful, return the ID of the created label
		return response.data.id;
	} catch (error) {
		if (error.code === 409) {
			// If the label already exists (HTTP status code 409 - conflict),
			// retrieve the list of labels and find the existing label by name
			const response = await gmail.users.labels.list({
				userId: "me",
			});
			const label = response.data.labels.find(
				(label) => label.name === labelName
			);

			// Return the ID of the existing label
			return label.id;
		} else {
			// If the error is not due to label conflict, throw the error
			throw error;
		}
	}
};

//Moves the given message to the label with the given labelId
const sendReply = async (auth, message) => {
	console.log("function sendReply got hit  ");

	// Create a Gmail API instance using the provided authentication
	const gmail = google.gmail({ version: "v1", auth });

	// Retrieve the details of the original message (such as Subject and From)
	const res = await gmail.users.messages.get({
		userId: "me",
		id: message.id,
		format: "metadata",
		metadataHeaders: ["Subject", "From"],
	});

	// Extract the Subject and From headers from the original message
	const subject = res.data.payload.headers.find(
		(header) => header.name === "Subject"
	).value;
	const from = res.data.payload.headers.find(
		(header) => header.name === "From"
	).value;

	// Extract the email address to which the reply will be sent - uses regex
	const replyTo = from.match(/<(.*)>/)[1];

	// Create the Subject for the reply, adding "Re:" in the original subject if not present
	const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

	// Compose the body of the reply
	const replyBody = `Hi, \n\nI will get back to you soon.\n\n Best, \nYousuf Ejaz Ahmad`;

	// Construct the raw MIME-formatted email message
	const rawMessage = [
		`From: me`,
		`To: ${replyTo}`,
		`Subject: ${replySubject}`,
		`In-Reply-To: ${message.id}`,
		`References: ${message.id}`,
		"",
		replyBody,
	].join("\n");

	// Convert the raw message to base64 encoding for transmission
	const encodedMessage = Buffer.from(rawMessage)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	// Use the Gmail API to send the composed reply
	await gmail.users.messages.send({
		userId: "me",
		requestBody: {
			raw: encodedMessage,
		},
	});
};

const getUnrepliedMessages = async (auth) => {
	console.log("function getUnrepliesMessages got hitted  ");

	// Create a Gmail API instance using the provided authentication
	const gmail = google.gmail({ version: "v1", auth });

	// Use the Gmail API to list messages in the inbox based on specified criteria
	const response = await gmail.users.messages.list({
		userId: "me",
		labelIds: ["INBOX"],
		q: "-in:chats -from:me -has:userlabels",
	});

	// Return the array of messages or an empty array if no messages are found
	return response.data.messages || [];
};

const addLabel = async (auth, message, labelId) => {
	// Create a Gmail API instance using the provided authentication
	const gmail = google.gmail({ version: "v1", auth });

	// Use the Gmail API to modify the labels of the specified message
	await gmail.users.messages.modify({
		userId: "me",
		id: message.id,
		requestBody: {
			addLabelIds: [labelId],
			removeLabelIds: ["INBOX"],
		},
	});
};

module.exports = {
	createLabel,
	sendReply,
	getUnrepliedMessages,
	addLabel,
};

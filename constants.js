const path = require("path");
const process = require("process");

const labelName = "Vacation-Mails";
const SCOPES = [
	"https://www.googleapis.com/auth/gmail.modify",
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/gmail.labels",
];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

module.exports = {
	labelName,
	SCOPES,
	TOKEN_PATH,
	CREDENTIALS_PATH,
};

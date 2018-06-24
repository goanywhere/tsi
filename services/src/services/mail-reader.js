var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
var h2p = require('html2plaintext')

function readFile(path, opts = 'utf8') {
    return new Promise((res, rej) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) rej(err)
            else res(data)
        })
    })

}

function atob(text) {
    var buf = new Buffer(text, "base64");
    var bytes = [];
    for (var i = buf.length; i >= 0; i--) {
        bytes[i] = String.fromCharCode(buf[i]);
    }

    return bytes.join("");
};


// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Change token directory to your system preference
var TOKEN_DIR = ('credentials/');
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';

var gmail = google.gmail('v1');
var globalOauth2Client

async function authorizeMailer() {
    const clientSecret = await readFile('client_secret.json')
    globalOauth2Client = await getOAuth2Client(JSON.parse(clientSecret))
    return globalOauth2Client
}

async function getOAuth2Client(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];

    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    try {
        const authFile = await readFile(TOKEN_PATH)
        oauth2Client.credentials = JSON.parse(authFile);
        return oauth2Client
    } catch (err) {
        const newClient = await assignNewToken(oauth2Client);
        return newClient
    }
}

function assignNewToken(oauth2Client) {
    return new Promise((resolve, reject) => {
        var authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    reject(err)
                }
                oauth2Client.credentials = token;
                storeToken(token);
                resolve(oauth2Client)
            });
        });
    })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

async function listEmails(params) {
    if(!globalOauth2Client){
        await authorizeMailer()
    }
    return new Promise((resolve, reject) => {
        gmail.users.messages.list({ auth: globalOauth2Client, userId: 'me', maxResults: 3, ...params}, (error, response) => {
            if (error) reject(error)
            else resolve(response['data']['messages'])
        })
    })
}

async function getOneMail(messageId) {
    if(!globalOauth2Client){
        await authorizeMailer()
    }
    return new Promise((resolve, reject) => {
        gmail.users.messages.get({ auth: globalOauth2Client, userId: 'me', 'id': messageId }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject(err)
            }
            var parts = [response.data.payload];

            let message = ''
            while (parts.length) {
                var part = parts.shift();
                if (part.parts) {
                    parts = parts.concat(part.parts);
                }

                if (part.mimeType === 'text/html') {
                    var decodedPart = decodeURIComponent(escape(atob(part.body.data.replace(/\-/g, '+').replace(/\_/g, '/'))));
                    message += decodedPart
                }
            }
            resolve({
                response,
                content: h2p(message).replace(/\0[\s\S]*$/g,'')
            })
        });
    })
}

async function getUnReadEmails() {
    const emails = await listEmails({q: 'is:unread'})
    const result = await Promise.all(emails.map(async (email) => {
        const message = await getOneMail(email.id)
        return {email, message}
    }))
    return result
}

module.exports = {
    getUnReadEmails
}

var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
const SCOPES = [ 'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events', 
  'https://www.googleapis.com/auth/userinfo.profile', 
  'https://www.googleapis.com/auth/userinfo.email'];

  var TOKEN_PATH = './calendar-nodejs-quickstart.json';

// We need things such as our client ID and secret, which we can read from a file
const googleSecrets = JSON.parse(fs.readFileSync('client_secret.json')).web;

// Create an OAuth2 client which we use to generate an auth URL
// and exchange the code for a token
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

// Generate an authentication URL for us to visit
var authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('Authorize this app by visiting this url: ', authUrl);

// Once we have a token, save it
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the code from that page here: ', function(code) {
  rl.close();
  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token:', err.response.data.error_description);
        oauth2Client.refreshToken_(token, (err, login) => {
            if (err) {
                console.log('Google Id token was not refreshed due to error.', err);
                // return callback(err, login);
            } else if (login) {
                const payload = login.getPayload();
                // return callback(null, payload);
                try {
                  fs.mkdirSync('./');
                } catch (err) {
                  if (err.code != 'EEXIST') {
                    throw err;
                  }
                }
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log("Your credentials have been written to", TOKEN_PATH);
            }
        });
        return;
    }

    try {
      fs.mkdirSync('./');
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log("Your credentials have been written to", TOKEN_PATH);
  });
});
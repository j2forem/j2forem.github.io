// Global variables for Client ID and OAuth scope
const CLIENT_ID = '67955600118-faqe0ln6t56pgnd7gnakcc1j5nqpc0qc.apps.googleusercontent.com';  // Replace with your actual Client ID
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Load the API client library and initialize the OAuth 2.0 client
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Initialize the Google API client with the Client ID (remove API Key)
function initClient() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

        // Handle the initial sign-in state
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(function (error) {
        console.error('Error initializing the API client:', error);
    });
}

// Update the UI depending on the user's sign-in status
function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('User signed in');
        // Fetch data from Google Sheets after sign-in
        fetchSheetData();
    } else {
        console.log('User not signed in');
    }
}

// Handle the sign-in button click
function handleSignInClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Handle the sign-out button click
function handleSignOutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

// Fetch data from Google Sheets using OAuth2 token
function fetchSheetData() {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const oauthToken = user.getAuthResponse().access_token;

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o',  // Replace with your actual Spreadsheet ID
        range: 'Sheet1!A1:B10',  // Adjust the range as needed
        headers: {
            'Authorization': `Bearer ${oauthToken}`  // Use the OAuth2 token for authorization
        }
    }).then(function(response) {
        const data = response.result.values;
        console.log('Data from Google Sheets:', data);
        // Handle the fetched data here
    }, function(error) {
        console.error('Error fetching data from Google Sheets:', error);
    });
}

// Example function to update data in Google Sheets using OAuth2 token
function updateSheetData(range, values) {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const oauthToken = user.getAuthResponse().access_token;

    const params = {
        spreadsheetId: 'YOUR_SPREADSHEET_ID',  // Replace with your Spreadsheet ID
        range: range,
        valueInputOption: 'USER_ENTERED',
        headers: {
            'Authorization': `Bearer ${oauthToken}`  // Use the OAuth2 token for authorization
        }
    };

    const valueRangeBody = {
        values: values
    };

    gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody).then(function(response) {
        console.log('Data updated successfully in Google Sheets', response);
    }).catch(function(error) {
        console.error('Error updating data in Google Sheets:', error);
    });
}

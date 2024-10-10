// Global variables to store the API key, Client ID, and other settings
const CLIENT_ID = '67955600118-faqe0ln6t56pgnd7gnakcc1j5nqpc0qc.apps.googleusercontent.com';  // Replace with your actual Client ID
const API_KEY = 'AIzaSyDEVH3dZ2qjSwXviTNWw0CrpeV99vj8Ww0';  // Replace with your actual API Key

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Load the API client library and initialize the OAuth 2.0 client
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Initialize the Google API client with the Client ID and API Key
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
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

// Example function to fetch data from Google Sheets (replace with your own logic)
function fetchSheetData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: 'YOUR_SPREADSHEET_ID',  // Replace with your Spreadsheet ID
        range: 'Sheet1!A1:B10',  // Adjust the range based on your sheet's structure
    }).then(function(response) {
        var range = response.result;
        console.log('Data from Google Sheets:', range.values);
        // Handle the fetched data and update your UI as needed
    }, function(error) {
        console.error('Error fetching data from Google Sheets:', error);
    });
}

// Example function to update data in Google Sheets (replace with your own logic)
function updateSheetData(range, values) {
    const params = {
        spreadsheetId: 'YOUR_SPREADSHEET_ID',  // Replace with your Spreadsheet ID
        range: range,
        valueInputOption: 'USER_ENTERED'
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

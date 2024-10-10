// Your Google Sheets spreadsheet ID
const sheetId = '1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o';  // Replace with your actual sheet ID

let currencyData = {
    Gold: 0,
    Silver: 0,
    Copper: 0,
    Platinum: 0,
    Electrum: 0
};

// Function to load the Google API client and initialize the Sheets API
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Function to initialize the Google API client after it has loaded
function initClient() {
    gapi.client.init({
        clientId: 'YOUR_CLIENT_ID',  // Replace with your actual OAuth Client ID
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function () {
        // Once initialized, fetch the sheet data
        fetchSheetData();  
    }).catch(function(error) {
        console.error('Error during gapi client initialization', error);
    });
}

// Function to fetch data from Google Sheets using OAuth token
function fetchSheetData() {
    const sheetRange = 'Money!A:B';  // Adjust this range to your actual sheet range
    const authInstance = gapi.auth2.getAuthInstance();  // Get the Google Auth instance
    const user = authInstance.currentUser.get();  // Get the signed-in user
    const oauthToken = user.getAuthResponse().access_token;  // Get the OAuth token

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange
    }).then(function(response) {
        const data = response.result.values;  // Get the data from the response
        if (!data || data.length === 0) {
            console.error("No data found in the sheet.");
            return;
        }
        console.log('Data from Google Sheets:', data);
        parseCurrencyData(response.result);  // Parse and display the fetched data
    }).catch(function(error) {
        console.error('Error fetching data from Google Sheets:', error);
    });
}

// Function to parse the fetched data and update the DOM
function parseCurrencyData(sheetData) {
    console.log("Parsing currency data:", sheetData);
    const rows = sheetData.values || [];

    // Reset the currencyData object
    currencyData = {
        Gold: 0,
        Silver: 0,
        Copper: 0,
        Platinum: 0,
        Electrum: 0
    };

    // Loop through each row and map the currencies
    rows.forEach(row => {
        if (row.length === 2) {
            const currencyType = row[0];
            const amount = parseInt(row[1]);

            if (currencyType === "Gold") currencyData["Gold"] = amount;
            else if (currencyType === "Silver") currencyData["Silver"] = amount;
            else if (currencyType === "Copper") currencyData["Copper"] = amount;
            else if (currencyType === "Platinum") currencyData["Platinum"] = amount;
            else if (currencyType === "Electrum") currencyData["Electrum"] = amount;

            console.log(`Currency: ${currencyType}, Amount: ${amount}`);
        } else {
            console.error('Unexpected row structure:', row);
        }
    });

    displayCurrency();  // Update the DOM after parsing
}

// Function to display currency values in the DOM
function displayCurrency() {
    document.getElementById('gold-amount').innerText = currencyData['Gold'] || 0;
    document.getElementById('silver-amount').innerText = currencyData['Silver'] || 0;
    document.getElementById('copper-amount').innerText = currencyData['Copper'] || 0;
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'] || 0;
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'] || 0;
}

// Event listener to call fetchSheetData when the page loads
document.addEventListener('DOMContentLoaded', function () {
    fetchSheetData();
});

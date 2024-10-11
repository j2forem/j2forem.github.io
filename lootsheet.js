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
    gapi.load('client:auth2', function() {
        gapi.auth2.init().then(initClient).catch(function(error) {
            console.error('Error during gapi client initialization', error);
        });
    });
}

// Function to initialize the Google API client after it has loaded
function initClient() {
    gapi.client.init({
        clientId: 'YOUR_REAL_CLIENT_ID',  // Replace with your actual OAuth Client ID
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function () {
        fetchSheetData();  // Fetch the data once everything is initialized
    }).catch(function(error) {
        console.error('Error initializing gapi client', error);
    });
}

// Function to fetch data from Google Sheets using OAuth token
function fetchSheetData() {
    const sheetRange = 'Money!A:B';  // Adjust this range to your actual sheet range
    const authInstance = gapi.auth2.getAuthInstance();  // Get the Google Auth instance
    if (!authInstance) {
        console.error("Auth instance is not initialized");
        return;
    }
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
    const rows = sheetData.values || [];
    currencyData = { Gold: 0, Silver: 0, Copper: 0, Platinum: 0, Electrum: 0 };  // Reset currency data

    rows.forEach(row => {
        if (row.length === 2) {
            const currencyType = row[0];
            const amount = parseInt(row[1]);

            if (currencyType === "Gold") currencyData["Gold"] = amount;
            else if (currencyType === "Silver") currencyData["Silver"] = amount;
            else if (currencyType === "Copper") currencyData["Copper"] = amount;
            else if (currencyType === "Platinum") currencyData["Platinum"] = amount;
            else if (currencyType === "Electrum") currencyData["Electrum"] = amount;
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

// Function to handle the update when the "Update Currency" button is clicked
function updateCurrency() {
    // Get the selected currency type from the dropdown
    const currencyType = document.getElementById('currency-type').value;

    // Get the amount to add or remove from the input field
    const amount = parseInt(document.getElementById('amount').value);

    // Validate if the amount is a valid number
    if (isNaN(amount) || amount === 0) {
        alert("Please enter a valid amount.");
        return;
    }

    // Call modifyItemQuantity to update the currency in the DOM and Google Sheets
    modifyItemQuantity(currencyType, amount);
}

// Function to modify the item quantity and update both the DOM and Google Sheets
function modifyItemQuantity(currencyType, amount) {
    // Get the current amount of the selected currency
    const currentAmount = currencyData[currencyType];
    
    // Calculate the new amount by adding or subtracting the entered amount
    const newAmount = currentAmount + amount;

    // Prevent negative values
    if (newAmount < 0) {
        alert("You cannot have a negative amount of currency.");
        return;
    }

    // Update the displayed value in the DOM
    document.getElementById(`${currencyType.toLowerCase()}-amount`).innerText = newAmount;

    // Update the internal data structure with the new amount
    currencyData[currencyType] = newAmount;

    // Now, push the updated value back to Google Sheets
    updateSheetData(currencyType, newAmount);
}

// Function to update a specific cell in Google Sheets
function updateSheetData(currencyType, newValue) {
    // Map currency types to row numbers
    const rowMap = {
        Gold: 1,
        Silver: 2,
        Copper: 3,
        Platinum: 4,
        Electrum: 5
    };

    const rowNumber = rowMap[currencyType];  // Get the row number for this currency
    const sheetRange = `Money!B${rowNumber}:B${rowNumber}`;  // Target the correct row and column

    const body = {
        values: [
            [newValue]  // Send the new value to Google Sheets
        ]
    };

    const authInstance = gapi.auth2.getAuthInstance();  // Get the Google Auth instance
    const user = authInstance.currentUser.get();  // Get the signed-in user
    const oauthToken = user.getAuthResponse().access_token;  // Get the OAuth token

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`  // Use OAuth token for authorization
        },
        body: JSON.stringify(body)
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log('Data successfully updated in Google Sheets:', data);
    }).catch(error => {
        console.error('Error updating data in Google Sheets:', error);
    });
}

// Call fetchSheetData when the page loads to populate the DOM with data
document.addEventListener('DOMContentLoaded', function () {
    fetchSheetData();
});

// Function to update currency and push changes to Google Sheets
function updateCurrency(currencyType, amount) {
    currencyData[currencyType] += amount;

    // Prevent negative values
    if (currencyData[currencyType] < 0) {
        currencyData[currencyType] = 0;
    }

    // Update the DOM
    document.getElementById(`${currencyType.toLowerCase()}-amount`).innerText = currencyData[currencyType];

    // Push the updated data to Google Sheets
    updateSheetData(currencyType, currencyData[currencyType]);
}

// Function to update a specific cell in Google Sheets
function updateSheetData(currencyType, newValue) {
    // Map currency types to row numbers in the sheet
    const rowMap = {
        Gold: 1,
        Silver: 2,
        Copper: 3,
        Platinum: 4,
        Electrum: 5
    };

    const rowNumber = rowMap[currencyType];
    const sheetRange = `Money!B${rowNumber}:B${rowNumber}`; // Update the appropriate row

    const body = {
        values: [[newValue]] // Send the new value
    };

    // Get the OAuth token
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const oauthToken = user.getAuthResponse().access_token;

    // Update the sheet with the new value
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        console.log(`Updated ${currencyType} in Google Sheets:`, data);
    })
    .catch(error => {
        console.error(`Error updating ${currencyType} in Google Sheets:`, error);
    });
}

// Fetch the current data from Google Sheets
function fetchSheetData() {
    const sheetRange = 'Money!A:B'; // Adjust to your sheet's range

    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const oauthToken = user.getAuthResponse().access_token;

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange
    }).then(function(response) {
        const data = response.result.values;
        if (!data || data.length === 0) {
            console.error("No data found in the sheet.");
            return;
        }
        parseCurrencyData(data);
    }).catch(function(error) {
        console.error("Error fetching data from Google Sheets:", error);
    });
}

// Parse the fetched data and display it in the UI
function parseCurrencyData(sheetData) {
    currencyData = { Gold: 0, Silver: 0, Copper: 0, Platinum: 0, Electrum: 0 }; // Reset

    sheetData.forEach(row => {
        const [currencyType, amount] = row;
        if (currencyType && amount) {
            currencyData[currencyType] = parseInt(amount);
        }
    });

    // Update the UI with the fetched data
    document.getElementById('gold-amount').innerText = currencyData['Gold'];
    document.getElementById('silver-amount').innerText = currencyData['Silver'];
    document.getElementById('copper-amount').innerText = currencyData['Copper'];
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'];
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'];
}

// Load the data from Google Sheets when the page loads
document.addEventListener('DOMContentLoaded', fetchSheetData);

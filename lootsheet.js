const sheetId = '1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o';  // Replace with your actual sheet ID


let currencyData = {
    Gold: 0,
    Silver: 0,
    Copper: 0,
    Platinum: 0,
    Electrum: 0
};

// This is the new function using OAuth (REPLACE with this)
function fetchSheetData() {
    const sheetRange = 'Money!A:B';  // Adjust this range to your actual sheet range
    const authInstance = gapi.auth2.getAuthInstance();  // Get the Google Auth instance
    const user = authInstance.currentUser.get();  // Get the signed-in user
    const oauthToken = user.getAuthResponse().access_token;  // Get the OAuth token for this user

    // Now call the Google Sheets API, authenticated with the OAuth token
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,  // Use your existing sheet ID variable
        range: sheetRange,  // The range to fetch from your sheet
        headers: {
            'Authorization': `Bearer ${oauthToken}`  // Authenticate using the OAuth token
        }
    }).then(function(response) {
        const data = response.result.values;  // Get the data from the response
        console.log('Data from Google Sheets:', data);  // Log or use the data in your UI
        // Handle the fetched data here (e.g., update your loot tracker UI)
    }, function(error) {
        console.error('Error fetching data from Google Sheets:', error);  // Handle any errors
    });
}


// Function to parse the data and display it in the DOM
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
            const currencyType = row[0];  // Get the currency type from column A
            const amount = parseInt(row[1]);  // Get the amount from column B

            // Match the currencyType with the sheet structure ("Gold", "Silver", etc.)
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
    console.log("Updating currency in DOM:", currencyData);

    document.getElementById('gold-amount').innerText = currencyData['Gold'] || 0;
    document.getElementById('silver-amount').innerText = currencyData['Silver'] || 0;
    document.getElementById('copper-amount').innerText = currencyData['Copper'] || 0;
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'] || 0;
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'] || 0;

    console.log("Gold updated to:", document.getElementById('gold-amount').innerText);
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
    const oauthToken = user.getAuthResponse().access_token;  // Get the OAuth token for this user
    
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
    
        body: JSON.stringify(body)
    }
    then(response => response.json())
    .then(data => {
        console.log(`Successfully updated ${currencyType} to ${newValue} in Google Sheets`, data);
    })
    .catch(error => {
        console.error('Error updating Google Sheets:', error);
    });


// Call fetchSheetData when the page loads to populate the DOM with data
document.addEventListener('DOMContentLoaded', function () {
    fetchSheetData();
});

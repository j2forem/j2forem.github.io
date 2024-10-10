const sheetId = 'Y1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o';  // Replace with your actual sheet ID
const apiKey = 'AIzaSyDEVH3dZ2qjSwXviTNWw0CrpeV99vj8Ww0';    // Replace with your actual Google API key

let currencyData = {
    Gold: 0,
    Silver: 0,
    Copper: 0,
    Platinum: 0,
    Electrum: 0
};

// Function to fetch data from Google Sheets
function fetchSheetData() {
    const sheetRange = 'Money!A:B';  // Adjust this range to where your data is located
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            parseCurrencyData(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to parse the data and display it in the DOM
function parseCurrencyData(sheetData) {
    const rows = sheetData.values || [];

    rows.forEach(row => {
        const currencyType = row[0];
        const amount = parseInt(row[1]);

        if (currencyType === "Gold Pieces") currencyData["Gold"] = amount;
        else if (currencyType === "Silver Pieces") currencyData["Silver"] = amount;
        else if (currencyType === "Copper Pieces") currencyData["Copper"] = amount;
        else if (currencyType === "Platinum Pieces") currencyData["Platinum"] = amount;
        else if (currencyType === "Electrum Pieces") currencyData["Electrum"] = amount;
    });

    displayCurrency();  // Update the DOM with the fetched values
}

// Function to display the currency values in the DOM
function displayCurrency() {
    document.getElementById('gold-amount').innerText = currencyData['Gold'];
    document.getElementById('silver-amount').innerText = currencyData['Silver'];
    document.getElementById('copper-amount').innerText = currencyData['Copper'];
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'];
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'];
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

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?valueInputOption=USER_ENTERED&key=${apiKey}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        console.log(`Successfully updated ${currencyType} to ${newValue} in Google Sheets`, data);
    })
    .catch(error => {
        console.error('Error updating Google Sheets:', error);
    });
}

// Call fetchSheetData when the page loads to populate the DOM with data
document.addEventListener('DOMContentLoaded', function () {
    fetchSheetData();
});

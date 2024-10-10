const sheetId = '1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o';  // Replace with your Google Sheets ID
const apiKey = 'AIzaSyDEVH3dZ2qjSwXviTNWw0CrpeV99vj8Ww0';    // Replace with your Google API key

// The sheet ranges for each tab
const categoryTabs = {
    weapons: 'Weapons!A:E',
    armor: 'Armor!A:E',
    potions: 'Potions!A:E',
    scrolls: 'Scrolls!A:E',
    gems: 'Gems!A:E',
    miscmagicitems: 'MiscMagicItems!A:E',
    unidmagicitems: 'UnidMagicItems!A:E',
    money: 'Money!A:B'
};

// Initialize global variables to store data
let itemsData = {};
let currencyData = {};

// Fetch data from the Google Sheet
function fetchSheetData(category) {
    console.log("Fetching data for category:", category);  // Log before fetching data

    const sheetRange = categoryTabs[category] || categoryTabs['money'];
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);  // Log after data is fetched

            if (category === 'money') {
                parseCurrencyData(data);  // Call parseCurrencyData if it's the money tab
            } else {
                parseCategoryData(data, category);  // Call parseCategoryData for other tabs
            }
        })
        .catch(error => console.error('Error fetching sheet data:', error));
}


function parseCurrencyData(sheetData) {
    console.log("Parsing currency data:", sheetData);  // Log the data being parsed

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
        if (row.length === 2) {  // Ensure each row has exactly 2 elements
            const currencyType = row[0];
            const amount = parseInt(row[1]);  // Ensure the amount is treated as a number

            // Map the long names from the sheet to the short names
            if (currencyType === "Gold Pieces") currencyData["Gold"] = amount;
            else if (currencyType === "Silver Pieces") currencyData["Silver"] = amount;
            else if (currencyType === "Copper Pieces") currencyData["Copper"] = amount;
            else if (currencyType === "Platinum Pieces") currencyData["Platinum"] = amount;
            else if (currencyType === "Electrum Pieces") currencyData["Electrum"] = amount;

            console.log(`Currency: ${currencyType}, Amount: ${amount}`);  // Log each parsed row
        } else {
            console.error('Unexpected row structure:', row);  // Log unexpected row structures
        }
    });

    displayCurrency();  // Update the DOM after parsing
}



// Display currency values in the DOM
function displayCurrency() {
    console.log("Updating currency in DOM:", currencyData);  // Log the currency data before updating the DOM

    document.getElementById('gold-amount').innerText = currencyData['Gold'] || 0;
    document.getElementById('silver-amount').innerText = currencyData['Silver'] || 0;
    document.getElementById('copper-amount').innerText = currencyData['Copper'] || 0;
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'] || 0;
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'] || 0;

    console.log("Gold updated to:", document.getElementById('gold-amount').innerText);  // Log after the DOM is updated
}


// Parse item data from the category and display it
function parseCategoryData(sheetData, category) {
    const rows = sheetData.values || [];
    itemsData[category] = [];

    rows.slice(1).forEach(row => {
        const [name, description, location, date, quantity] = row;
        const item = { name, description, location, date, quantity: parseInt(quantity) };
        if (item.quantity > 0) {
            itemsData[category].push(item);
        }
    });

    displayItems(category);
}

// Display items in the DOM
function displayItems(category) {
    const list = document.getElementById(`${category}-list`);
    list.innerHTML = '';

    const items = itemsData[category] || [];
    items.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <div>
                <strong>${item.name}</strong> - Qty: ${item.quantity}, ${item.description}, Location: ${item.location}, Date: ${item.date}
            </div>
            <div>
                <button onclick="modifyItemQuantity('${category}', ${index}, 1)">+</button>
                <button onclick="modifyItemQuantity('${category}', ${index}, -1)">-</button>
                <button onclick="deleteItem('${category}', ${index})">Delete</button>
            </div>
        `;
        list.appendChild(itemRow);
    });
}

// Function to update the currency values (called when "Update Currency" is clicked)
function updateCurrency() {
    const currencyType = document.getElementById('currency-type').value;
    const amount = parseInt(document.getElementById('amount').value);

    currencyData[currencyType] = (currencyData[currencyType] || 0) + amount;
    displayCurrency();
}

// Helper function to modify item quantity
function modifyItemQuantity(category, index, amount) {
    itemsData[category][index].quantity += amount;
    if (itemsData[category][index].quantity < 0) itemsData[category][index].quantity = 0;
    displayItems(category);
}

// Show specific tab content
function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active-content'));

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));

    document.getElementById(tabName).classList.add('active-content');
    event.target.classList.add('active-tab');

    fetchSheetData(tabName);  // Fetch data for the selected tab
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed.");
    fetchSheetData('money');
});


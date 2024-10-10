let itemsData = {};
let currencyData = {};

// The base URL for Google Sheets API
const baseSheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o/values/`;

// Sheet tab names (to match your Google Sheet tabs for categories)
const categoryTabs = {
    Weapons: 'Weapons!A1:E100',
    Armor: 'Armor!A1:E100',
    Potions: 'Potions!A1:E100',
    Scrolls: 'Scrolls!A1:E100',
    Money: 'Money!A1:B6'  // Assuming "Money" tab contains currency info
};

// API key for accessing the Google Sheets
const apiKey = 'YOUR_API_KEY';

document.addEventListener('DOMContentLoaded', function () {
    // Load currency data
    fetchCategoryData('Money');
});

// Show the selected tab
function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active-content'));

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));

    document.getElementById(tabName).classList.add('active-content');
    event.target.classList.add('active-tab');
}

// Fetch and display data for the selected category (e.g., Weapons, Armor, etc.)
function fetchCategoryData(category) {
    const sheetRange = categoryTabs[category];
    const sheetUrl = `${baseSheetUrl}${sheetRange}?key=${apiKey}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            if (category === 'Money') {
                parseCurrencyData(data);
            } else {
                parseCategoryData(data, category);
                displayItems(category);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Parse Google Sheets data for categories (Weapons, Armor, etc.)
function parseCategoryData(sheetData, category) {
    const rows = sheetData.values || [];

    // Clear current category data
    itemsData[category] = [];

    // Assume the first row is the header
    rows.slice(1).forEach(row => {
        const [name, description, location, date, quantity] = row;
        const item = {
            name,
            description,
            location,
            date,
            quantity: parseInt(quantity)
        };

        // Add only items with quantity > 0
        if (item.quantity > 0) {
            itemsData[category].push(item);
        }
    });
}

// Display items in the list for the selected category
function displayItems(category) {
    const list = document.getElementById('item-list');
    list.innerHTML = ''; // Clear existing items

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

// Parse currency data from the "Money" sheet tab
function parseCurrencyData(sheetData) {
    const rows = sheetData.values || [];

    // Clear current currency data
    currencyData = {};

    rows.forEach(row => {
        const [currencyType, amount] = row;
        currencyData[currencyType] = parseInt(amount);
    });

    displayCurrency();
}

// Display the currency data
function displayCurrency() {
    document.getElementById('gold-amount').textContent = currencyData.Gold || 0;
    document.getElementById('silver-amount').textContent = currencyData.Silver || 0;
    document.getElementById('copper-amount').textContent = currencyData.Copper || 0;
    document.getElementById('platinum-amount').textContent = currencyData.Platinum || 0;
    document.getElementById('electrum-amount').textContent = currencyData.Electrum || 0;
}

// Update currency when the user changes it
function updateCurrency() {
    const currencyType = document.getElementById('currency-type').value;
    const amount = parseInt(document.getElementById('amount').value);

    if (currencyData[currencyType] !== undefined) {
        currencyData[currencyType] += amount;
        if (currencyData[currencyType] < 0) currencyData[currencyType] = 0;
    }

    displayCurrency();
    // You can implement Google Sheets update logic here to persist changes
}
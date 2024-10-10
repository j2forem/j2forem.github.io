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
    const sheetRange = categoryTabs[category] || categoryTabs['money'];
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            if (category === 'money') {
                parseCurrencyData(data);
            } else {
                parseCategoryData(data, category);
            }
        })
        .catch(error => console.error('Error fetching sheet data:', error));
}

// Parse currency data and display it in the DOM
function parseCurrencyData(sheetData) {
    const rows = sheetData.values || [];
    rows.forEach(row => {
        const [currencyType, amount] = row;
        currencyData[currencyType] = parseInt(amount);
    });
    displayCurrency();
}

// Display currency values in the DOM
function displayCurrency() {
    document.getElementById('gold-amount').innerText = currencyData['Gold'] || 0;
    document.getElementById('silver-amount').innerText = currencyData['Silver'] || 0;
    document.getElementById('copper-amount').innerText = currencyData['Copper'] || 0;
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'] || 0;
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'] || 0;
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

// Initial data fetch
document.addEventListener('DOMContentLoaded', function () {
    fetchSheetData('money');  // Load money tab by default
});

// Google Sheets ID and API key
const sheetId = '1KukjiJx6mXf-zHJ5oqb75e15fMx0n0WV3Ed2MdYKu2o';  // Replace with your Google Sheets ID
const apiKey = 'AAIzaSyDEVH3dZ2qjSwXviTNWw0CrpeV99vj8Ww0';  // Replace with your Google API key

// Range of data in the Google Sheet (adjust as necessary)
const sheetRange = 'Sheet1!A1:D100'; // Adjust the range based on your sheet's structure

// Construct the URL for the Google Sheets API request
const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;


document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from Google Sheets
    function fetchSheetData() {
        return fetch(sheetUrl)
            .then(response => response.json())
            .then(data => {
                const parsedData = parseSheetData(data);
                window.itemsData = parsedData;
                showTab('money'); // Default tab is the money tab
            })
            .catch(error => console.error('Error fetching sheet data:', error));
    }

    function parseSheetData(sheetData) {
        // Assuming sheetData.values is the array of rows from your Google Sheet
        const rows = sheetData.values;

        const categories = {
            weapons: [],
            armor: [],
            potions: []
            // Add other categories as necessary
        };

        // Parse each row and add it to the appropriate category
        rows.slice(1).forEach(row => {
            const [category, name, quantity, description] = row;
            if (categories[category.toLowerCase()]) {
                categories[category.toLowerCase()].push({ name, quantity, description });
            }
        });

        return categories;
    }

    // Function to show tab content
    function showTab(tabName) {
        const tabContentDiv = document.getElementById('tab-content');
        
        // If the tab is "money", show the static money tab content
        if (tabName === 'money') {
            document.getElementById('money').style.display = 'block';
            return;
        } else {
            document.getElementById('money').style.display = 'none';
        }

        const items = window.itemsData[tabName] || [];

        // Clear previous content for dynamic tabs (weapons, armor, etc.)
        tabContentDiv.innerHTML = '';

        // Add items dynamically to the tab content
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <div>
                    <strong>${item.name}</strong> (${item.quantity}) - ${item.description}
                    <button onclick="modifyItem('${tabName}', '${item.name}', 1)">+</button>
                    <button onclick="modifyItem('${tabName}', '${item.name}', -1)">-</button>
                    <button onclick="deleteItem('${tabName}', '${item.name}')">Delete</button>
                </div>
            `;
            tabContentDiv.appendChild(itemDiv);
        });

        // Add "Add New Item" button for dynamic tabs
        const addItemButton = document.createElement('button');
        addItemButton.innerHTML = 'Add New Item';
        addItemButton.onclick = function () {
            addItem(tabName);
        };
        tabContentDiv.appendChild(addItemButton);
    }

    // Helper functions (you will need to implement these)
    function modifyItem(tabName, itemName, amount) {
        // Logic to update item quantity in Google Sheets
    }

    function deleteItem(tabName, itemName) {
        // Logic to delete item from Google Sheets
    }

    function addItem(tabName) {
        // Logic to add a new item
    }

    // Fetch data from Google Sheets when the page loads
    fetchSheetData();
});

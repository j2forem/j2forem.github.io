// Initialize currency data with local storage persistence
let currencyData = {
    Gold: localStorage.getItem('Gold') ? parseInt(localStorage.getItem('Gold')) : 0,
    Silver: localStorage.getItem('Silver') ? parseInt(localStorage.getItem('Silver')) : 0,
    Copper: localStorage.getItem('Copper') ? parseInt(localStorage.getItem('Copper')) : 0,
    Platinum: localStorage.getItem('Platinum') ? parseInt(localStorage.getItem('Platinum')) : 0,
    Electrum: localStorage.getItem('Electrum') ? parseInt(localStorage.getItem('Electrum')) : 0,
};

// Function to update the currency amount
function updateCurrency(currencyType, amount) {
    // Update the currency amount in memory
    currencyData[currencyType] += amount;

    // Prevent negative values
    if (currencyData[currencyType] < 0) {
        currencyData[currencyType] = 0;
    }

    // Update the DOM
    document.getElementById(`${currencyType.toLowerCase()}-amount`).innerText = currencyData[currencyType];

    // Save to local storage so it persists
    localStorage.setItem(currencyType, currencyData[currencyType]);
}

// Load initial values into the DOM on page load
window.onload = function () {
    document.getElementById('gold-amount').innerText = currencyData['Gold'];
    document.getElementById('silver-amount').innerText = currencyData['Silver'];
    document.getElementById('copper-amount').innerText = currencyData['Copper'];
    document.getElementById('platinum-amount').innerText = currencyData['Platinum'];
    document.getElementById('electrum-amount').innerText = currencyData['Electrum'];
};

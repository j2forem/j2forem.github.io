// Global variable to track initial currency
let initialCurrency = {
  platinum: 0,
  gold: 0,
  electrum: 0,
  silver: 0,
  copper: 0
};

// Function to display an error message in the UI
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = message;
}

// Function to clear any error messages in the UI
function clearErrorMessage() {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = '';  // Clear the error message
}

// Function to fetch and display total party funds from DB
async function displayPartyFunds() {
  try {
    clearErrorMessage();  // Clear previous error messages
    const currencyData = await window.fetchPartyFunds();  // Fetch latest data from Firestore

    if (currencyData) {
      // Update the UI with coin values only if there are changes in the data
      if (
        currencyData.Platinum !== initialCurrency.platinum ||
        currencyData.Gold !== initialCurrency.gold ||
        currencyData.Electrum !== initialCurrency.electrum ||
        currencyData.Silver !== initialCurrency.silver ||
        currencyData.Copper !== initialCurrency.copper
      ) {
        initialCurrency = {
          platinum: parseFloat(currencyData.Platinum) || 0,
          gold: parseFloat(currencyData.Gold) || 0,
          electrum: parseFloat(currencyData.Electrum) || 0,
          silver: parseFloat(currencyData.Silver) || 0,
          copper: parseFloat(currencyData.Copper) || 0
        };

        // Display individual coin values in the UI
        document.getElementById('platinum-display').textContent = `${initialCurrency.platinum} coins`;
        document.getElementById('gold-display').textContent = `${initialCurrency.gold} coins`;
        document.getElementById('electrum-display').textContent = `${initialCurrency.electrum} coins`;
        document.getElementById('silver-display').textContent = `${initialCurrency.silver} coins`;
        document.getElementById('copper-display').textContent = `${initialCurrency.copper} coins`;

        // Calculate and display the total gold equivalent
        calculateTotalGold();
      }
    } else {
      displayErrorMessage('No currency data found in the database.');
    }
  } catch (error) {
    displayErrorMessage(`Error fetching party funds: ${error.message}`);
    console.error("Error fetching party funds:", error);
  }
}

// Function to calculate and display the total gold equivalent
function calculateTotalGold() {
  try {
    // Convert all currency to the gold equivalent
    const totalInGold =
      initialCurrency.platinum * 5 +   // 1 Platinum = 5 Gold
      initialCurrency.gold +           // 1 Gold = 1 Gold
      initialCurrency.electrum * 0.5 + // 1 Electrum = 0.5 Gold
      initialCurrency.silver * 0.1 +   // 1 Silver = 0.1 Gold
      initialCurrency.copper * 0.01;   // 1 Copper = 0.01 Gold

    // Update the total gold in the UI
    document.getElementById('total-gold').textContent = totalInGold.toFixed(2);
  } catch (error) {
    displayErrorMessage(`Error calculating total gold: ${error.message}`);
    console.error("Error calculating total gold:", error);
  }
}

// Function to modify coins and update Firestore
async function modifyCoins(coinType) {
  try {
    clearErrorMessage();  // Clear any previous errors
    const inputField = document.getElementById(`${coinType.toLowerCase()}-input`);
    const modificationAmount = parseFloat(inputField.value) || 0;

    if (modificationAmount === 0) {
      displayErrorMessage(`No modification amount entered for ${coinType}.`);
      return;
    }

    const newCoinValue = initialCurrency[coinType.toLowerCase()] + modificationAmount;

    if (newCoinValue < 0) {
      displayErrorMessage(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Update Firestore with the exact case-sensitive field names
    const updates = {};
    updates[coinType] = newCoinValue;

    await window.updatePartyFunds(updates);

    await displayPartyFunds();  // Refresh to show updated values

    inputField.value = 0;  // Reset the input field after update
  } catch (error) {
    displayErrorMessage(`Error updating ${coinType} coins: ${error.message}`);
    console.error(`Error updating ${coinType} coins:`, error);
  }
}

// Initial call to display the funds when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);

// Auto-refresh total funds every 5 seconds
setInterval(() => {
  displayPartyFunds();
}, 5000);

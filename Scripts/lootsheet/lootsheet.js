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
      // Update the UI with coin values (Use correct case-sensitive field names)
      initialCurrency = {
        Platinum: parseFloat(currencyData.Platinum) || 0,
        Gold: parseFloat(currencyData.Gold) || 0,
        Electrum: parseFloat(currencyData.Electrum) || 0,
        Silver: parseFloat(currencyData.Silver) || 0,
        Copper: parseFloat(currencyData.Copper) || 0
      };

      // Display individual coin values in the UI (Match the correct IDs in the HTML)
      document.getElementById('Platinum-display').textContent = `${initialCurrency.Platinum} coins`;
      document.getElementById('Gold-display').textContent = `${initialCurrency.Gold} coins`;
      document.getElementById('Electrum-display').textContent = `${initialCurrency.Electrum} coins`;
      document.getElementById('Silver-display').textContent = `${initialCurrency.Silver} coins`;
      document.getElementById('Copper-display').textContent = `${initialCurrency.Copper} coins`;

      // Calculate and display the total gold equivalent
      calculateTotalGold();
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
      initialCurrency.Platinum * 5 +   // 1 Platinum = 5 Gold
      initialCurrency.Gold +           // 1 Gold = 1 Gold
      initialCurrency.Electrum * 0.5 + // 1 Electrum = 0.5 Gold
      initialCurrency.Silver * 0.1 +   // 1 Silver = 0.1 Gold
      initialCurrency.Copper * 0.01;   // 1 Copper = 0.01 Gold

    // Update the total gold in the UI
    document.getElementById('total-gold').textContent = totalInGold.toFixed(2);
  } catch (error) {
    displayErrorMessage(`Error calculating total gold: ${error.message}`);
    console.error("Error calculating total gold:", error);
  }
}

// Function to calculate and display the weight of the coins
function calculateWeight(coinType, coinCount) {
  try {
    const coinWeight = (coinCount / 50).toFixed(2);  // Each coin weighs 1/50 lb
    document.getElementById(`${coinType}-weight`).textContent = `${coinWeight} lbs`;
  } catch (error) {
    displayErrorMessage(`Error calculating weight for ${coinType}: ${error.message}`);
    console.error(`Error calculating weight for ${coinType}:`, error);
  }
}

// Function to modify coins and update Firestore (triggered by "Update" button)
async function playerdbUpdate(coinType) {
  try {
    clearErrorMessage();
    const inputField = document.getElementById(`${coinType}-input`);
    const modificationAmount = parseFloat(inputField.value) || 0;

    if (modificationAmount === 0) {
      displayErrorMessage(`No modification amount entered for ${coinType}.`);
      return;
    }

    const currencyData = await window.fetchPartyFunds();  // Fetch the current values from Firestore
    const currentCoinValue = parseFloat(currencyData[coinType.charAt(0).toUpperCase() + coinType.slice(1)]) || 0;
    const newCoinValue = currentCoinValue + modificationAmount;

    if (newCoinValue < 0) {
      displayErrorMessage(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Update Firestore with the new value
    const updates = {};
    updates[coinType.charAt(0).toUpperCase() + coinType.slice(1)] = newCoinValue;
    await window.updatePartyFunds(updates);

    // Refresh the coin count and weight
    await playerRequest(coinType);
    inputField.value = 0;  // Reset the input field after update
  } catch (error) {
    displayErrorMessage(`Error updating ${coinType} coins: ${error.message}`);
    console.error(`Error updating ${coinType} coins:`, error);
  }
}

// Existing functions like displayPartyFunds(), calculateTotalGold(), etc. can remain unchanged

// Auto-refresh total funds every 5 seconds
setInterval(() => {
  displayPartyFunds();  // Auto-refresh total party funds
}, 5000);

// Error handling display function
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = message;
}

// Function to clear error message
function clearErrorMessage() {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = '';  // Clear any existing error messages
}

// Initial call to display the funds when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);

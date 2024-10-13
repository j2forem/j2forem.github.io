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
      // Update the UI with coin values
      initialCurrency = {
        Platinum: parseFloat(currencyData.Platinum) || 0,
        Gold: parseFloat(currencyData.Gold) || 0,
        Electrum: parseFloat(currencyData.Electrum) || 0,
        Silver: parseFloat(currencyData.Silver) || 0,
        Copper: parseFloat(currencyData.Copper) || 0
      };

      // Display individual coin values in the UI
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

// Function to fetch individual coin values when player requests it (Get coin count)
async function playerRequest(coinType) {
  try {
    const currencyData = await window.fetchPartyFunds();  // Fetch the latest currency data
    const coinCount = currencyData[coinType] || 0;
    document.getElementById(`${coinType}-display`).textContent = `${coinCount} coins`;

    // Update the weight display
    const weight = (coinCount * 0.02).toFixed(2);  // Each coin weighs 1/50 lb (0.02 lbs)
    document.getElementById(`${coinType}-weight`).textContent = `${weight} lbs`;

  } catch (error) {
    displayErrorMessage(`Error fetching ${coinType} count: ${error.message}`);
    console.error(`Error fetching ${coinType} count:`, error);
  }
}

// Function to modify coins and update Firestore (Add/Subtract coins)
async function playerdbUpdate(coinType) {
  try {
    clearErrorMessage();  // Clear any previous errors
    const inputField = document.getElementById(`${coinType}-input`);
    const modificationAmount = parseFloat(inputField.value) || 0;

    if (modificationAmount === 0) {
      displayErrorMessage(`No modification amount entered for ${coinType}.`);
      return;
    }

    const currencyData = await window.fetchPartyFunds();
    const newCoinValue = currencyData[coinType] + modificationAmount;

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

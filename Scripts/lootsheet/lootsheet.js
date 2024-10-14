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
      // Update the UI with coin values
      initialCurrency = {
        platinum: parseFloat(currencyData.Platinum) || 0,
        gold: parseFloat(currencyData.Gold) || 0,
        electrum: parseFloat(currencyData.Electrum) || 0,
        silver: parseFloat(currencyData.Silver) || 0,
        copper: parseFloat(currencyData.Copper) || 0
      };


// Display individual coin values in the UI
document.getElementById('Platinum-display').textContent = `${initialCurrency.platinum} coins`;
document.getElementById('Gold-display').textContent = `${initialCurrency.gold} coins`;
document.getElementById('Electrum-display').textContent = `${initialCurrency.electrum} coins`;
document.getElementById('Silver-display').textContent = `${initialCurrency.silver} coins`;
document.getElementById('Copper-display').textContent = `${initialCurrency.copper} coins`;

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

    // Fetch the current coin values from the database
    const currencyData = await window.fetchPartyFunds();

    // Get the current value for the selected coin type
    const currentCoinValue = currencyData[coinType] || 0;
    
    // Calculate the new coin value (adding or subtracting)
    const newCoinValue = currentCoinValue + modificationAmount;

    if (newCoinValue < 0) {
      displayErrorMessage(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Update Firestore with the new value for the specific currency field
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

window.playerdbUpdate = playerdbUpdate;
window.playerRequest = playerRequest;
window.fetchPartyFunds = fetchPartyFunds;
window.updatePartyFunds = updatePartyFunds;

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

// Function to fetch individual coin values when player requests it (Get coin count)
async function playerRequest(coinType) {
  try {
    const currencyData = await window.fetchPartyFunds();  // Fetch the latest currency data
    const coinCount = currencyData[coinType] || 0;        // Get the coin count from the DB
    
    // Update the coin display in the UI
    document.getElementById(`${coinType}-display`).textContent = `${coinCount} coins`;

    // Log the coin count for debugging
    console.log(`${coinType} Count from DB: `, coinCount);

    // Calculate the weight of the coins (each coin weighs 0.02 lbs)
    const weight = (coinCount * 0.02).toFixed(2);  // Weight calculation
    console.log(`${coinType} Weight: `, weight);   // Log the calculated weight

    // Update the weight display in the UI
    document.getElementById(`${coinType}-weight`).textContent = `${weight} lbs`;

  } catch (error) {
    displayErrorMessage(`Error fetching ${coinType} count: ${error.message}`);
    console.error(`Error fetching ${coinType} count:`, error);
  }
}




// Initial call to display the funds when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);

// Auto-refresh total funds every 5 seconds
setInterval(() => {
  displayPartyFunds();
}, 5000);

// Initial call to display the funds right when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);

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



// Initial call to display the funds when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);

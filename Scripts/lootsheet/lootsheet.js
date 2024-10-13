// Variables to store initial currency values fetched from the DB
let initialCurrency = {
  platinum: 0,
  gold: 0,
  electrum: 0,
  silver: 0,
  copper: 0
};

// Conversion rates
const conversionRates = {
  copperToGold: 1 / 100,         // 100 copper = 1 gold
  silverToGold: 1 / 10,          // 10 silver = 1 gold
  electrumToGold: 1 / 2,         // 2 electrum = 1 gold
  platinumToGold: 5              // 1 platinum = 5 gold
};

// Function to fetch and display total party funds from DB
async function displayPartyFunds() {
  try {
    const currencyData = await window.fetchPartyFunds(); // Fetch latest data from Firestore

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
      document.getElementById('platinum-display').textContent = `${initialCurrency.platinum} coins`;
      document.getElementById('gold-display').textContent = `${initialCurrency.gold} coins`;
      document.getElementById('electrum-display').textContent = `${initialCurrency.electrum} coins`;
      document.getElementById('silver-display').textContent = `${initialCurrency.silver} coins`;
      document.getElementById('copper-display').textContent = `${initialCurrency.copper} coins`;

      // Calculate and display the total gold equivalent
      calculateTotalGold();
    }
  } catch (error) {
    console.error("Error fetching party funds:", error);
  }
}

// Function to calculate and display the total gold equivalent
function calculateTotalGold() {
  // Convert all currency to the gold equivalent
  const totalInGold =
    initialCurrency.platinum * 5 +   // 1 Platinum = 5 Gold
    initialCurrency.gold +           // 1 Gold = 1 Gold
    initialCurrency.electrum * 0.5 + // 1 Electrum = 0.5 Gold
    initialCurrency.silver * 0.1 +   // 1 Silver = 0.1 Gold
    initialCurrency.copper * 0.01;   // 1 Copper = 0.01 Gold

  // Update the total gold in the UI
  document.getElementById('total-gold').textContent = totalInGold.toFixed(2);
}

// Manual refresh when clicking on the H2 element (if required)
document.getElementById('total-funds').addEventListener('click', displayPartyFunds);

// Auto-refresh every 5 seconds
setInterval(() => {
  displayPartyFunds();  // Call the function every 5 seconds to refresh total funds
}, 5000);

// Initial call to display the funds right when the page loads
document.addEventListener('DOMContentLoaded', displayPartyFunds);


// Function to modify coins and update Firestore
async function modifyCoins(coinType) {
  try {
    const inputField = document.getElementById(`${coinType}-input`);
    const modificationAmount = parseFloat(inputField.value) || 0;

    // Ensure that `initialCurrency` is up-to-date
    if (!initialCurrency) {
      console.error('Currency data not loaded.');
      return;
    }

    // Calculate the new coin value
    const currentCoinValue = initialCurrency[capitalizeFirstLetter(coinType)] || 0; // Ensure proper case
    const newCoinValue = currentCoinValue + modificationAmount;

    // Prevent negative coin values
    if (newCoinValue < 0) {
      console.log(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Prepare the update object for Firestore
    const updates = {};
    updates[capitalizeFirstLetter(coinType)] = newCoinValue;  // Use proper case here

    // Update Firestore with the new coin value
    await window.updatePartyFunds(updates);

    // Refresh the display with the updated party funds
    await displayPartyFunds();

    // Reset the input field
    inputField.value = 0;

  } catch (error) {
    console.error(`Error updating ${coinType} coins:`, error);
  }
}

// Helper function to capitalize the first letter (ensure correct Firestore field matching)
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}



// Auto-refresh total party funds every 5 seconds
setInterval(displayPartyFunds, 5000);  // Fetch latest data from Firestore every 5 seconds

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded. Click on 'Update' buttons to modify party funds.");
});

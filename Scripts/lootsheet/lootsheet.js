// Global category for item search
let selectedCategory = 'Weapons';  // Default category

// Variables to store initial currency values fetched from the DB
let initialCurrency = {
  platinum: 0,
  gold: 0,
  electrum: 0,
  silver: 0,
  copper: 0
};

// Function to fetch individual coin values when the player clicks the coin label
async function fetchCoinValue(coinType) {
  try {
    const currencyData = await window.fetchPartyFunds();  // Use the global fetchPartyFunds function
    
    // Update the specific coin type's display and weight
    const coinAmount = currencyData[capitalizeFirstLetter(coinType)] || 0;
    document.getElementById(`${coinType}-display`).textContent = `${coinAmount} coins`;
    document.getElementById(`${coinType}-weight`).textContent = `${(coinAmount / 50).toFixed(2)} lbs`;  // Weight based on 50 coins per pound

    // Store the fetched value in the initialCurrency object
    initialCurrency[coinType] = coinAmount;

    // Only recalculate total after fetching from the DB
    calculateTotalGold();
  } catch (error) {
    console.error(`Error fetching ${coinType} coins:`, error);
  }
}

// Function to modify the number of coins and push the new value to the DB
async function modifyCoins(coinType) {
  try {
    const inputField = document.getElementById(`${coinType}-input`);
    const modificationAmount = parseFloat(inputField.value) || 0;

    // Calculate the new total for this coin type
    const newCoinValue = initialCurrency[coinType] + modificationAmount;
    if (newCoinValue < 0) {
      console.log(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Update the display and weight based on the new coin value
    document.getElementById(`${coinType}-display`).textContent = `${newCoinValue} coins`;
    document.getElementById(`${coinType}-weight`).textContent = `${(newCoinValue / 50).toFixed(2)} lbs`;

    // Update the DB with the new value
    const currencyUpdate = {};
    currencyUpdate[capitalizeFirstLetter(coinType)] = newCoinValue;
    await window.updatePartyFunds(currencyUpdate);  // Assuming window.updatePartyFunds is defined elsewhere to update the DB

    // Fetch updated values from the DB after modification and update the display
    const updatedCurrencyData = await window.fetchPartyFunds();  // Fetch the latest values from the DB after the update

    // Update the initialCurrency object with the new values from the DB
    initialCurrency = {
      platinum: updatedCurrencyData.Platinum || 0,
      gold: updatedCurrencyData.Gold || 0,
      electrum: updatedCurrencyData.Electrum || 0,
      silver: updatedCurrencyData.Silver || 0,
      copper: updatedCurrencyData.Copper || 0
    };

    // Recalculate the total gold value based on the latest data from the DB
    calculateTotalGold();

    // Clear the input field after successful update
    inputField.value = 0;
  } catch (error) {
    console.error(`Error updating ${coinType} coins:`, error);
  }
}

// Helper function to capitalize the first letter of the coin type (for matching the database fields)
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Conversion rates
const conversionRates = {
  copperToGold: 1 / 100,         // 100 copper = 1 gold
  silverToGold: 1 / 10,          // 10 silver = 1 gold
  electrumToGold: 1 / 2,         // 2 electrum = 1 gold
  platinumToGold: 5              // 1 platinum = 5 gold
};

// Function to calculate total gold based on initial DB values only (no manual input)
function calculateTotalGold() {
  const totalGold = 
    initialCurrency.platinum * conversionRates.platinumToGold + 
    initialCurrency.gold + 
    initialCurrency.electrum * conversionRates.electrumToGold + 
    initialCurrency.silver * conversionRates.silverToGold + 
    initialCurrency.copper * conversionRates.copperToGold;
  
  // Update the total gold display
  document.getElementById('total-gold').textContent = totalGold.toFixed(2);  // Limit to 2 decimal places
}

// Auto-refresh the total party funds every 5 seconds
setInterval(async function () {
  try {
    const currencyData = await window.fetchPartyFunds();  // Fetch the latest values from the DB

    // Update the initialCurrency object with the fetched values
    initialCurrency = {
      platinum: currencyData.Platinum || 0,
      gold: currencyData.Gold || 0,
      electrum: currencyData.Electrum || 0,
      silver: currencyData.Silver || 0,
      copper: currencyData.Copper || 0
    };

    // Recalculate the total gold value based on the latest data
    calculateTotalGold();
  } catch (error) {
    console.error("Error auto-refreshing total party funds:", error);
  }
}, 5000);  // Refresh every 5 seconds

// On page load, don't automatically fetch the total party funds or coins, but fetch on demand
document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded. Click on 'Party Funds' or 'Get Coins' to fetch values.");
});

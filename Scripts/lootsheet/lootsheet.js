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

// Function to fetch total party funds manually when clicking the "Party Funds" header
document.getElementById('party-funds').addEventListener('click', calculateTotalGold);

// Fetch individual coin values when player requests it (for each coin type)
async function fetchCoinValue(coinType) {
  try {
    const currencyData = await window.fetchPartyFunds();  // Use the global fetchPartyFunds function
    
    // Update the specific coin type's display and weight
    const coinAmount = currencyData[capitalizeFirstLetter(coinType)] || 0;
    document.getElementById(`${coinType}-display`).textContent = `${coinAmount} coins`;
    document.getElementById(`${coinType}-weight`).textContent = `${(coinAmount / 50).toFixed(2)} lbs`;  // Weight based on 50 coins per pound

    // Update the initial currency so that the total is calculated correctly
    initialCurrency[coinType] = coinAmount;

    // Recalculate total after fetching the coin value
    calculateTotalGold();
  } catch (error) {
    console.error(`Error fetching ${coinType} coins:`, error);
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

// Function to calculate total gold based on initial DB values and manual inputs
function calculateTotalGold() {
  const platinum = parseFloat(document.getElementById('platinum-input').value) || 0;
  const gold = parseFloat(document.getElementById('gold-input').value) || 0;
  const electrum = parseFloat(document.getElementById('electrum-input').value) || 0;
  const silver = parseFloat(document.getElementById('silver-input').value) || 0;
  const copper = parseFloat(document.getElementById('copper-input').value) || 0;

  // Convert each currency (DB + Player input) to gold equivalent
  const totalGold = 
    (initialCurrency.platinum + platinum) * conversionRates.platinumToGold + 
    (initialCurrency.gold + gold) + 
    (initialCurrency.electrum + electrum) * conversionRates.electrumToGold + 
    (initialCurrency.silver + silver) * conversionRates.silverToGold + 
    (initialCurrency.copper + copper) * conversionRates.copperToGold;
  
  // Update the total gold display
  document.getElementById('total-gold').textContent = totalGold.toFixed(2);  // Limit to 2 decimal places
}

// Add event listeners to each currency input for real-time calculation
document.getElementById('platinum-input').addEventListener('input', calculateTotalGold);
document.getElementById('gold-input').addEventListener('input', calculateTotalGold);
document.getElementById('electrum-input').addEventListener('input', calculateTotalGold);
document.getElementById('silver-input').addEventListener('input', calculateTotalGold);
document.getElementById('copper-input').addEventListener('input', calculateTotalGold);

// On page load, don't automatically fetch the total party funds or coins, but fetch on demand
document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded. Click on 'Party Funds' or 'Get Coins' to fetch values.");
});

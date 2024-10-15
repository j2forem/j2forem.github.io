import { fetchPartyFunds, updatePartyFunds } from '../../../config/firebase.js';
import { updateCoinDisplay, calculateTotalGold, displayErrorMessage, clearErrorMessage } from './ui.js';

let initialCurrency = {
  platinum: 0,
  gold: 0,
  electrum: 0,
  silver: 0,
  copper: 0
};
// Expose spendFromTotalFunds for testing in the console
window.spendFromTotalFunds = spendFromTotalFunds;
// Display party funds and calculate total gold
document.addEventListener('DOMContentLoaded', () => {
  // Test spending from total funds after the page is loaded
  spendFromTotalFunds(50);  // Spend 50 gold
});


async function displayPartyFunds() {
  try {
    clearErrorMessage();
    console.log('Fetching party funds from Firestore...');  // Debug log

    const currencyData = await fetchPartyFunds();  // Fetch data from Firestore
    console.log('Fetched currency data:', currencyData);  // Debug log to show fetched data

    if (currencyData) {
      // Assign data to initialCurrency, matching case exactly
      initialCurrency = {
        platinum: parseFloat(currencyData.Platinum) || 0,    // Notice capitalization
        gold: parseFloat(currencyData.Gold) || 0,
        electrum: parseFloat(currencyData.Electrum) || 0,
        silver: parseFloat(currencyData.Silver) || 0,
        copper: parseFloat(currencyData.Copper) || 0
      };

      console.log('Updated initialCurrency object:', initialCurrency);  // Debug log

      // Update coin display for each currency type
      Object.keys(initialCurrency).forEach(coinType => {
        const coinCount = initialCurrency[coinType];
        const weight = coinCount / 50;  // Calculate weight (50 coins = 1 lb)
        console.log(`Updating display for ${coinType}: ${coinCount} coins, ${weight.toFixed(2)} lbs`);  // Debug log

        updateCoinDisplay(coinType, coinCount, weight);  // Update the UI
      });

      // Update total gold display
      calculateTotalGold(initialCurrency);
    } else {
      displayErrorMessage('No currency data found.');
    }
  } catch (error) {
    displayErrorMessage(`Error fetching party funds: ${error.message}`);
    console.error('Error fetching party funds:', error);  // Log the error if one occurs
  }
}
// Expose spendFromTotalFunds for testing in the console
window.spendFromTotalFunds = spendFromTotalFunds;


async function spendFromTotalFunds(amountInGold) {
  // Fetch the latest party funds data
  const currencyData = await fetchPartyFunds();
  const { platinum, gold, electrum, silver, copper } = currencyData;

  // Calculate total funds in gold equivalent
  const totalGold = platinum * 5 + gold + electrum * 0.5 + silver * 0.1 + copper * 0.01;

  if (amountInGold > totalGold) {
    displayErrorMessage("Insufficient funds!");
    return;
  }

  let remainingAmount = amountInGold;

  // Deduct from platinum first (each platinum is worth 5 gold)
  let platinumToDeduct = Math.min(remainingAmount / 5, platinum);
  remainingAmount -= platinumToDeduct * 5;

  // Deduct from gold
  let goldToDeduct = Math.min(remainingAmount, gold);
  remainingAmount -= goldToDeduct;

  // Deduct from electrum (each electrum is worth 0.5 gold)
  let electrumToDeduct = Math.min(remainingAmount / 0.5, electrum);
  remainingAmount -= electrumToDeduct * 0.5;

  // Deduct from silver (each silver is worth 0.1 gold)
  let silverToDeduct = Math.min(remainingAmount / 0.1, silver);
  remainingAmount -= silverToDeduct * 0.1;

  // Deduct from copper (each copper is worth 0.01 gold)
  let copperToDeduct = Math.min(remainingAmount / 0.01, copper);
  remainingAmount -= copperToDeduct * 0.01;

  // Create an object with the updated values for each coin type
  const updates = {
    platinum: platinum - platinumToDeduct,
    gold: gold - goldToDeduct,
    electrum: electrum - electrumToDeduct,
    silver: silver - silverToDeduct,
    copper: copper - copperToDeduct
  };

  // Log the updates object to ensure it's correctly created
  console.log("Preparing to call updatePartyFunds with updates:", updates);

  // Update the Firestore database with the new values
  try {
    await updatePartyFunds(updates);  // Ensure updatePartyFunds is called correctly
    console.log("Firestore updated successfully!");
  } catch (error) {
    console.error("Error updating Firestore:", error);
  }

  // Refresh the display with the updated totals from Firestore
  await displayPartyFunds();
}



// Function to update the coins and refresh Firestore
async function modifyCoins(coinType, modificationAmount) {
  try {
    const normalizedCoinType = coinType.toLowerCase();
    const currentCoinValue = initialCurrency[normalizedCoinType] || 0;
    const newCoinValue = currentCoinValue + modificationAmount;

    if (newCoinValue < 0) {
      displayErrorMessage(`Cannot have negative ${coinType} coins.`);
      return;
    }

    // Update Firestore
    const updates = { [coinType]: newCoinValue };
    await updatePartyFunds(updates);
    console.log(`Updated Firestore with new ${coinType} value:`, updates);  // Debug log

    // Refresh display
    await displayPartyFunds();
  } catch (error) {
    displayErrorMessage(`Error updating ${coinType} coins: ${error.message}`);
  }
}

// Attach event listeners after page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('Platinum-button').addEventListener('click', () => {
    const modificationAmount = parseFloat(document.getElementById('Platinum-input').value) || 0;
    modifyCoins('Platinum', modificationAmount);
  });

  document.getElementById('Gold-button').addEventListener('click', () => {
    const modificationAmount = parseFloat(document.getElementById('Gold-input').value) || 0;
    modifyCoins('Gold', modificationAmount);
  });

  document.getElementById('Electrum-button').addEventListener('click', () => {
    const modificationAmount = parseFloat(document.getElementById('Electrum-input').value) || 0;
    modifyCoins('Electrum', modificationAmount);
  });

  document.getElementById('Silver-button').addEventListener('click', () => {
    const modificationAmount = parseFloat(document.getElementById('Silver-input').value) || 0;
    modifyCoins('Silver', modificationAmount);
  });

  document.getElementById('Copper-button').addEventListener('click', () => {
    const modificationAmount = parseFloat(document.getElementById('Copper-input').value) || 0;
    modifyCoins('Copper', modificationAmount);
  });

  // Initial load of party funds
  displayPartyFunds();
});

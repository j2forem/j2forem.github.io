// ui.js

// Update the coin count and weight for a specific currency type
export function updateCoinDisplay(coinType, coinCount, weight) {
    const coinDisplayElement = document.getElementById(`${coinType.charAt(0).toUpperCase() + coinType.slice(1)}-display`);
    const weightElement = document.getElementById(`${coinType.charAt(0).toUpperCase() + coinType.slice(1)}-weight`);
  
    if (coinDisplayElement) {
      coinDisplayElement.textContent = `${coinCount} coins`;
    }
  
    if (weightElement) {
      weightElement.textContent = `${weight.toFixed(2)} lbs`;
    }
  }
  
  // Calculate and update total gold value
  export function calculateTotalGold(initialCurrency) {
    const totalInGold =
      initialCurrency.platinum * 5 +   // 1 Platinum = 5 Gold
      initialCurrency.gold +           // 1 Gold = 1 Gold
      initialCurrency.electrum * 0.5 + // 1 Electrum = 0.5 Gold
      initialCurrency.silver * 0.1 +   // 1 Silver = 0.1 Gold
      initialCurrency.copper * 0.01;   // 1 Copper = 0.01 Gold
  
    document.getElementById('total-gold').textContent = totalInGold.toFixed(2);
  }
  
  // Display an error message
  export function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
  }
  
  // Clear the error message
  export function clearErrorMessage() {
    displayErrorMessage('');
  }
  
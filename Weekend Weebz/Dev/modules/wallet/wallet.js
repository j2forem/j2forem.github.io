// modules/wallet/wallet.js

// Existing imports
import { db } from '../../../config/firebase.js';
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  increment,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Coin values in copper
const coinValues = {
  copper: 1,
  silver: 10,
  electrum: 50,
  gold: 100,
  platinum: 500,
};

// Function to calculate the number of coins from the database values
export function getNumberOfCoins(walletData) {
  const coins = {
    copper: (walletData.copper || 0) / coinValues.copper,
    silver: (walletData.silver || 0) / coinValues.silver,
    electrum: (walletData.electrum || 0) / coinValues.electrum,
    gold: (walletData.gold || 0) / coinValues.gold,
    platinum: (walletData.platinum || 0) / coinValues.platinum,
  };

  // Ensure we have integer coin counts
  coins.copper = Math.floor(coins.copper);
  coins.silver = Math.floor(coins.silver);
  coins.electrum = Math.floor(coins.electrum);
  coins.gold = Math.floor(coins.gold);
  coins.platinum = Math.floor(coins.platinum);

  return coins;
}

// Function to calculate the total copper value from coin counts
export function calculateTotalCopper(coins) {
  const totalCopper =
    (coins.copper || 0) * coinValues.copper +
    (coins.silver || 0) * coinValues.silver +
    (coins.electrum || 0) * coinValues.electrum +
    (coins.gold || 0) * coinValues.gold +
    (coins.platinum || 0) * coinValues.platinum;
  return totalCopper;
}

// Function to update the wallet UI
function updateWalletUI(walletData) {
    console.log('Wallet data from Firestore (copper values):', walletData);
  
    // Step 1: Calculate the number of coins
    const coins = getNumberOfCoins(walletData);
    console.log('Number of coins:', coins);
  
    // Step 2: Calculate the weight of each coin type
    const coinWeights = {
      copper: coins.copper / 50,
      silver: coins.silver / 50,
      electrum: coins.electrum / 50,
      gold: coins.gold / 50,
      platinum: coins.platinum / 50,
    };
  
    // Step 3: Update the UI with the number of coins and their weights
    const coinTypes = ['copper', 'silver', 'electrum', 'gold', 'platinum'];
    for (const type of coinTypes) {
      const countElement = document.getElementById(`wallet-${type}-count`);
      const weightElement = document.getElementById(`wallet-${type}-weight`);
      if (countElement && weightElement) {
        countElement.textContent = coins[type];
        weightElement.textContent = coinWeights[type].toFixed(2);
      } else {
        console.error(`Element for ${type} not found.`);
      }
    }
  
    // Step 4: Calculate total value in copper and convert to gold
    const totalCopperValue = calculateTotalCopper(coins);
    const totalGoldValue = (totalCopperValue / coinValues.gold).toFixed(2); // Convert to gold
    
    console.log('Total value in gold:', totalGoldValue);
    
    const totalCopperElement = document.getElementById('total-copper-value');
    if (totalCopperElement) {
      totalCopperElement.textContent = `${totalGoldValue} gold`; // Display in gold
    } else {
      console.error('Element total-copper-value not found.');
    }
  
    // Step 5: Calculate and display total coin weight
    const totalWeight =
      coinWeights.copper +
      coinWeights.silver +
      coinWeights.electrum +
      coinWeights.gold +
      coinWeights.platinum;
  
    const walletWeightElement = document.getElementById('wallet-weight');
    if (walletWeightElement) {
      walletWeightElement.textContent = `Total Coin Weight: ${totalWeight.toFixed(2)} lbs`;
    } else {
      console.error('Element wallet-weight not found.');
    }
  }
  

// Function to modify coins
export function modifyCoins(coinType, action) {
  // Get the input value for the specified coin type
  const inputId = `modify-${coinType}`;
  const amountInput = document.getElementById(inputId);
  let amount = parseInt(amountInput.value, 10);

  // Validate the input
  if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
    alert('Please enter a valid positive whole number of coins.');
    return;
  }

  // Convert the number of coins to copper value
  const coinValue = coinValues[coinType];
  const valueToUpdate = amount * coinValue;

  if (action === 'add') {
    // Call the function to add coins
    addCoins(coinType, valueToUpdate);
  } else if (action === 'subtract') {
    // Call the function to subtract coins
    subtractCoins(coinType, valueToUpdate);
  }

  // Reset the input field
  amountInput.value = '0';
}

// Function to add coins
export function addCoins(coinType, valueToAdd) {
  // Update the database
  const walletDocRef = doc(db, 'PartyInventory', 'Currency');
  const updateData = {};
  updateData[coinType] = increment(valueToAdd); // Use Firestore's increment
  updateDoc(walletDocRef, updateData)
    .then(() => {
      console.log(`${valueToAdd / coinValues[coinType]} ${coinType} coins added.`);
    })
    .catch((error) => {
      console.error('Error updating wallet:', error);
    });
}

// Function to subtract coins
export async function subtractCoins(coinType, valueToSubtract) {
    const walletDocRef = doc(db, 'PartyInventory', 'Currency');
    try {
        const walletSnap = await getDoc(walletDocRef);
        if (walletSnap.exists()) {
            const walletData = walletSnap.data();
            const currentValue = walletData[coinType] || 0;
            console.log(`Current ${coinType} in Wallet:`, currentValue);
            console.log(`Attempting to subtract ${valueToSubtract} ${coinType}`);

            if (currentValue >= valueToSubtract) {
                const updateData = {};
                updateData[coinType] = increment(-valueToSubtract);
                await updateDoc(walletDocRef, updateData);
                console.log(`${valueToSubtract / coinValues[coinType]} ${coinType} coins subtracted.`);
            } else {
                alert(`Not enough ${coinType} coins to subtract.`);
                console.error('Not enough coins to subtract.');
            }
        } else {
            alert('Wallet data not found.');
            console.error('Wallet data not found.');
        }
    } catch (error) {
        console.error('Error updating wallet:', error);
    }
}


// Function to set up event listeners for the Modify Funds section
function setupModifyFundsListeners() {
  // Add event listeners for Add buttons
  const addButtons = document.querySelectorAll('.add-coin-btn');
  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const coinType = button.getAttribute('data-coin-type');
      modifyCoins(coinType, 'add');
    });
  });

  // Add event listeners for Subtract buttons
  const subtractButtons = document.querySelectorAll('.subtract-coin-btn');
  subtractButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const coinType = button.getAttribute('data-coin-type');
      modifyCoins(coinType, 'subtract');
    });
  });
}

// Initialization function to load the wallet module
export function loadWalletModule() {
  console.log('Loading Wallet Module...');
  fetch('/Weekend%20Weebz/Dev/modules/wallet/wallet.html')
    .then((response) => response.text())
    .then((html) => {
      console.log('Wallet HTML loaded.');
      const appDiv = document.getElementById('app');
      appDiv.insertAdjacentHTML('beforeend', html);

      // Wait for the DOM to update before initializing
      setTimeout(() => {
        initWallet();
        setupModifyFundsListeners();
      }, 0);
    })
    .catch((error) => {
      console.error('Error loading wallet module:', error);
    });
}

// Function to initialize the wallet
function initWallet() {
  console.log('Initializing Wallet...');
  const walletDocRef = doc(db, 'PartyInventory', 'Currency');

  // Real-time listener for wallet changes
  onSnapshot(
    walletDocRef,
    (docSnapshot) => {
      console.log('onSnapshot triggered');
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('Wallet data from Firestore:', data);
        updateWalletUI(data);
      } else {
        console.log('No wallet data found!');
      }
    },
    (error) => {
      console.error('Error fetching data from Firestore:', error);
    }
  );
}


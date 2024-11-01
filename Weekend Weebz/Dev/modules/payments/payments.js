import {db} from '../../../config/firebase.js'
import { subtractCoins } from '../wallet/wallet.js';
import { collection, doc,getDoc, getDocs,query,where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import {coinValues} from '../../config.js'
import { convertToCopper } from '../../utils.js';

function updateRemainingBalance(priceInCopper, platinumInput, goldInput, electrumInput, silverInput, copperInput) {
    // Convert player inputs to total copper value
    const totalPaymentInCopper = (platinumInput * 500) + (goldInput * 100) + (electrumInput * 50) + (silverInput * 10) + copperInput;

    // Calculate remaining balance
    let remainingBalance = priceInCopper - totalPaymentInCopper;

    // Handle overpayment: refund in lowest denominations
    let refund = 0;
    if (remainingBalance < 0) {
        refund = Math.abs(remainingBalance);
        remainingBalance = 0;
    }

    // Calculate refund in smallest denominations (favoring copper upwards)
    const refundPlatinum = Math.floor(refund / 500);
    refund %= 500;
    const refundGold = Math.floor(refund / 100);
    refund %= 100;
    const refundElectrum = Math.floor(refund / 50);
    refund %= 50;
    const refundSilver = Math.floor(refund / 10);
    const refundCopper = refund % 10;

    // Update UI with remaining balance and refund if applicable
    displayRemainingBalance(remainingBalance);
    displayRefund(refundPlatinum, refundGold, refundElectrum, refundSilver, refundCopper);
}

function displayRemainingBalance(remainingBalance) {
    const balanceElement = document.getElementById("remaining-balance");
    balanceElement.textContent = `Remaining Balance: ${remainingBalance} copper`;
}

function displayRefund(platinum, gold, electrum, silver, copper) {
    const refundElement = document.getElementById("refund");
    refundElement.textContent = `Refund: ${platinum} platinum, ${gold} gold, ${electrum} electrum, ${silver} silver, ${copper} copper`;
}

export { updateRemainingBalance, displayRemainingBalance, displayRefund };

// Helper function to calculate the required coin deduction
function calculateCoinDeduction(totalInCopper) {
    const coinBreakdown = { platinum: 0, gold: 0, electrum: 0, silver: 0, copper: 0 };
    let remainingCopper = totalInCopper;

    for (const [coinType, value] of Object.entries(coinValues)) {
        coinBreakdown[coinType] = Math.floor(remainingCopper / value);
        remainingCopper %= value;
    }

    return coinBreakdown;
}

export async function handlePayment(itemId, totalInCopper) {
    // Get user-entered coin values (e.g., 10 for gold means 10 gold coins)
    const coinInputs = getCoinInputs(itemId);
    
    // Convert player input to copper for validation and deduction
    const totalPaidInCopper = convertToCopper(coinInputs);

    console.log("Total Paid in Copper:", totalPaidInCopper);
    console.log("Total Cart Price in Copper:", totalInCopper);

    // Validate if total payment in copper meets or exceeds the required amount
    if (totalPaidInCopper < totalInCopper) {
        alert("Insufficient payment. Please enter the correct amount.");
        return false;
    }

    // Retrieve wallet data to confirm sufficient funds
    const walletDocRef = doc(db, 'PartyInventory', 'Currency');
    const walletSnap = await getDoc(walletDocRef);

    if (walletSnap.exists()) {
        const walletData = walletSnap.data();

        // Check if each denomination has enough coins, deduct in copper
        for (const [coinType, amount] of Object.entries(coinInputs)) {
            const copperValue = amount * coinValues[coinType];
            await subtractCoins(coinType, copperValue);
        }

        console.log("Payment successfully processed!");
        return true;
    } else {
        alert("Error: Wallet data not found.");
        return false;
    }
}

// Helper function to gather coin input values from the UI
function getCoinInputs(itemId) {
    const inputFields = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    const coinInputs = {};

    inputFields.forEach(coinType => {
        const inputElement = document.querySelector(`input[data-coin="${coinType}"]`);
        coinInputs[coinType] = inputElement ? parseInt(inputElement.value) || 0 : 0;
    });

    return coinInputs;
}

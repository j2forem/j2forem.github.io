import { db } from '../../config/firebase.js';
import { getDoc, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { renderCoins, renderTotalFunds } from '../ui/walletUI.js';

// Centralized state for the coins
export const state = {
    coins: {
        gold: { quantity: 0, value: 1, weightPerCoin: 0.02 },
        silver: { quantity: 0.1, value: 0.1, weightPerCoin: 0.02 },
        copper: { quantity: 0.01, value: 0.01, weightPerCoin: 0.02 },
        platinum: { quantity: 5, value: 5, weightPerCoin: 0.02 },
        electrum: { quantity: 0.5, value: 0.5, weightPerCoin: 0.02 },
    },
    appliedPayment: 0,
};

export async function fetchWalletData() {
    try {
        console.log('fetchWalletData called');
        const docRef = doc(db, 'PartyInventory', 'Currency');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const walletData = docSnap.data();
            Object.keys(walletData).forEach((coinType) => {
                const normalizedCoinType = coinType.toLowerCase();
                if (state.coins[normalizedCoinType]) {
                    state.coins[normalizedCoinType].quantity = walletData[coinType];
                }
            });

            renderCoins();
            renderTotalFunds();
            console.log('Wallet data fetched and rendered.');
        } else {
            console.error('No such document found!');
        }
    } catch (error) {
        console.error('Error during fetchWalletData execution:', error);
    }
}


export async function adjustPartyFunds(changes) {
    try {
        const docRef = doc(db, 'PartyInventory', 'Currency');
        console.log('Attempting to adjust Firestore with:', changes);

        // Update the local state first
        Object.keys(changes).forEach((coinType) => {
            if (state.coins[coinType]) {
                state.coins[coinType].quantity += changes[coinType];
                state.coins[coinType].quantity = Math.max(0, state.coins[coinType].quantity); // Prevent negative quantities
            }
        });

        // Prepare the updated quantities for Firestore
        const newQuantities = Object.fromEntries(
            Object.keys(state.coins).map(coinType => [coinType, state.coins[coinType].quantity])
        );

        // Update the Firestore document with the adjusted values
        await updateDoc(docRef, newQuantities);
        console.log('Party funds adjusted successfully!');

        // Render the updated values in the UI
        renderCoins();
        renderTotalFunds();
    } catch (error) {
        console.error('Error adjusting party funds:', error);
    }
}



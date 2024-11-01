import { state, adjustPartyFunds } from '../app/walletapp.js';
import { cartState, calculateCartTotal } from '../app/cartapp.js';
import { renderCoinBalances, renderPaymentInfo, coinElements, paymentMessageElem } from '../ui/paymentUI.js';
import { renderCoins } from '../ui/walletUI.js';

export async function applyPayment() {
    try {
        // Parse payment inputs as floating-point numbers with default to 0
        const platinum = parseFloat(coinElements.platinum.input.value) || 0;
        const gold = parseFloat(coinElements.gold.input.value) || 0;
        const electrum = parseFloat(coinElements.electrum.input.value) || 0;
        const silver = parseFloat(coinElements.silver.input.value) || 0;
        const copper = parseFloat(coinElements.copper.input.value) || 0;

        const originalPayment = { platinum, gold, electrum, silver, copper };

        // Calculate the total payment in gold equivalent, ensuring precise decimal calculations
        const totalPaymentInGold = parseFloat(
            (
                (platinum * 10) +
                gold +
                (electrum * 0.5) +
                (silver * 0.1) +
                (copper * 0.01)
            ).toFixed(2)
        );

        // Calculate the remaining balance after applying the payment
        const remainingBalance = parseFloat(
            (calculateCartTotal() - (state.appliedPayment || 0)).toFixed(2)
        );

        // Check if the total payment is sufficient for the remaining balance
        if (totalPaymentInGold < remainingBalance) {
            paymentMessageElem.textContent = 'Insufficient payment. You need more coins to complete this purchase.';
            return; // Exit if payment is insufficient
        }

        // Calculate the overage (change to be returned)
        const overage = parseFloat((totalPaymentInGold - remainingBalance).toFixed(2));

        // Check if the user has enough coins for the payment
        if (
            platinum > state.coins.platinum.quantity ||
            gold > state.coins.gold.quantity ||
            electrum > state.coins.electrum.quantity ||
            silver > state.coins.silver.quantity ||
            copper > state.coins.copper.quantity
        ) {
            paymentMessageElem.textContent = 'Insufficient coin quantities for this payment!';
            return; // Exit if there are not enough coins
        }

        // Apply payment and adjust Firestore before returning change
        await adjustPartyFunds({
            platinum: -platinum,
            gold: -gold,
            electrum: -electrum,
            silver: -silver,
            copper: -copper
        });

        // Update the local state with the applied payment
        state.appliedPayment = (state.appliedPayment || 0) + totalPaymentInGold;

        // Handle the overage (return change) if there is any
        if (overage > 0) {
            returnChange(overage, originalPayment);
        }

        // Re-render the UI with updated balances
        renderCoinBalances();
        renderPaymentInfo();
        renderCoins();

        const changeMessage = overage > 0 ? ` Change returned: ${overage.toFixed(2)} gold.` : '';
        paymentMessageElem.textContent = `Payment applied!${changeMessage}`;
        console.log('Payment applied successfully!', changeMessage);
    } catch (error) {
        console.error('Error applying payment:', error);
        paymentMessageElem.textContent = 'An error occurred while applying payment. Please try again.';
    }
}



function returnChange(overage, originalPayment) {
    let changePlatinum = 0;
    let changeGold = 0;
    let changeElectrum = 0;
    let changeSilver = 0;
    let changeCopper = 0;

    // Calculate change based on the original payment coins, starting with the smallest value coins
    if (originalPayment.copper > 0) {
        changeCopper = Math.min(originalPayment.copper, Math.round(overage / 0.01));
        overage -= changeCopper * 0.01;
        overage = parseFloat(overage.toFixed(2)); // Maintain precision
    }

    if (originalPayment.silver > 0 && overage > 0) {
        changeSilver = Math.min(originalPayment.silver, Math.floor(overage / 0.1));
        overage -= changeSilver * 0.1;
        overage = parseFloat(overage.toFixed(2)); // Maintain precision
    }

    if (originalPayment.electrum > 0 && overage > 0) {
        changeElectrum = Math.min(originalPayment.electrum, Math.floor(overage / 0.5));
        overage -= changeElectrum * 0.5;
        overage = parseFloat(overage.toFixed(2)); // Maintain precision
    }

    if (originalPayment.gold > 0 && overage > 0) {
        changeGold = Math.min(originalPayment.gold, Math.floor(overage));
        overage -= changeGold;
        overage = parseFloat(overage.toFixed(2)); // Maintain precision
    }

    if (originalPayment.platinum > 0 && overage > 0) {
        changePlatinum = Math.min(originalPayment.platinum, Math.floor(overage / 10));
        overage -= changePlatinum * 10;
        overage = parseFloat(overage.toFixed(2)); // Maintain precision
    }

    // Adjust party funds to add the returned change
    adjustPartyFunds({
        platinum: changePlatinum,
        gold: changeGold,
        electrum: changeElectrum,
        silver: changeSilver,
        copper: changeCopper
    });

    console.log(`Change returned: ${changePlatinum} platinum, ${changeGold} gold, ${changeElectrum} electrum, ${changeSilver} silver, ${changeCopper} copper.`);
}

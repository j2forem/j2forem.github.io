// Conversion rates based on config
import { coinValues } from './config.js';

// Converts denomination inputs to copper
export function convertToCopper({ platinum = 0, gold = 0, electrum = 0, silver = 0, copper = 0 }) {
    return (platinum * coinValues.platinum) +
           (gold * coinValues.gold) +
           (electrum * coinValues.electrum) +
           (silver * coinValues.silver) +
           copper;
}

// Converts a copper amount to denominations for display
export function convertFromCopper(copperAmount) {
    const result = {};
    result.platinum = Math.floor(copperAmount / coinValues.platinum);
    copperAmount %= coinValues.platinum;

    result.gold = Math.floor(copperAmount / coinValues.gold);
    copperAmount %= coinValues.gold;

    result.electrum = Math.floor(copperAmount / coinValues.electrum);
    copperAmount %= coinValues.electrum;

    result.silver = Math.floor(copperAmount / coinValues.silver);
    copperAmount %= coinValues.silver;

    result.copper = copperAmount;
    return result;
}


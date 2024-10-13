const admin = require('firebase-admin');
const serviceAccount = require('C:\\Users\\User\\Documents\\Take Two\\weekendweebz-firebase-adminsdk-3ip3p-8bf8899cd9.json');  // Replace with the path to your Firebase Admin SDK JSON file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Function to add an item to inventory
async function addItemToInventory(itemDetails) {
    const inventoryRef = firestore.collection('PartyInventory').doc('Currency');

    const {
        itemName,
        pricePerItem,
        quantity,
        source,
        location = null,
        isMagical = false,
        enchantmentDetails = null,
        uniqueFeatures = null
    } = itemDetails;

    const totalPrice = pricePerItem * quantity;

    if (source === 'merchant') {
        // Deduct currency for purchases
        await inventoryRef.update({
            'currency.gold': FieldValue.increment(-totalPrice)
        });
        console.log(`${quantity}x ${itemName} purchased for ${totalPrice} gold.`);
    } else if (source === 'loot') {
        // Log loot information with a timestamp
        const timestamp = new Date();
        console.log(`${quantity}x ${itemName} added as loot from ${location} at ${timestamp}.`);
    } else {
        console.log("Invalid source. Item not added.");
        return;
    }

    await inventoryRef.update({
        inventory: FieldValue.arrayUnion({
            item: itemName,
            pricePerItem: pricePerItem,
            quantity: quantity,
            source: source,
            location: source === 'loot' ? location : null,
            timestamp: source === 'loot' ? new Date() : null,
            uniqueFeatures: uniqueFeatures || null,
            isMagical: isMagical,
            enchantmentDetails: isMagical ? enchantmentDetails : null
        })
    });

    console.log(`${quantity}x ${itemName} added to inventory.`);
    await viewCurrency();  // Show the updated currency
}

// Function to display the current currency
async function viewCurrency() {
    const currencyRef = firestore.collection('PartyInventory').doc('Currency');
    const doc = await currencyRef.get();

    if (!doc.exists) {
        console.log('No currency data found!');
        return;
    }

    const currency = doc.data().currency;
    console.log("Current Currency:", currency);
}

// Function to view the entire party inventory
async function viewInventory() {
    const inventoryRef = firestore.collection('PartyInventory').doc('Currency');
    const doc = await inventoryRef.get();

    if (!doc.exists) {
        console.log('No inventory data found!');
        return;
    }

    const inventory = doc.data().inventory || [];
    console.log("Party Inventory:");

    inventory.forEach(item => {
        console.log(`Item: ${item.item}, Quantity: ${item.quantity}`);
        console.log(`Source: ${item.source}`);
        if (item.isMagical) {
            console.log(`Magical: Yes, Enchantment: ${item.enchantmentDetails}`);
        }
        if (item.uniqueFeatures) {
            console.log(`Features: ${item.uniqueFeatures}`);
        }
        console.log("--------");
    });
}

// Example call: Adding a sword purchased from a merchant
addItemToInventory({
    itemName: "Sword",
    pricePerItem: 15,
    quantity: 2,
    source: "merchant",
}).catch(console.error);

// Example call: Viewing the inventory
viewInventory().catch(console.error);

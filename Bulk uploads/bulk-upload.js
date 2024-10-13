const admin = require('firebase-admin');
const serviceAccount = require('C:\\Users\\User\\Documents\\Take Two\\weekendweebz-firebase-adminsdk-3ip3p-8bf8899cd9.json');  // Replace with the path to your Firebase Admin SDK JSON file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

// Load your bulk data
const bulkData = require('./equipment_data.json');  // Load your JSON file with bulk data

// Function to bulk upload items
async function bulkUpload() {
    const batch = firestore.batch();  // Create a batch operation

    for (const [category, items] of Object.entries(bulkData)) {
        const collectionRef = firestore.collection('Equipment');  // Reference to the Equipment collection

        items.forEach(item => {
            const newItemRef = collectionRef.doc();  // Create a new document for each item
            batch.set(newItemRef, { ...item, category: category });  // Add category field to each document
        });
    }

    await batch.commit();  // Commit the batch operation
    console.log("Bulk data uploaded successfully!");
}

bulkUpload().catch(console.error);


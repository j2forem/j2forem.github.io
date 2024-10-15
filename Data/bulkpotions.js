const admin = require('firebase-admin');
const { serviceAccountPath } = require('./config'); // Import the service account path from config.js
const fs = require('fs').promises;
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath); // Use the path from the config
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount)
});

// Firestore instance
const db = admin.firestore();

// potions file
const potionsFile = 'potions.json';

// Function to upload potions data from a file
async function uploadpotionsFromFile(filePath) {
 try {
 const data = await fs.readFile(filePath, 'utf-8'); // Read the JSON file
 const potionsData = JSON.parse(data); // Parse the JSON content

 const collectionRef = db.collection('Potions');  // Reference 'potions' collection

 // Iterate over each potions category (e.g., Plate, Leather, Shields)
for (const [category, items] of Object.entries(potionsData)) {
const docRef = collectionRef.doc(category);   // Each category as a document
 
 // Create an object to hold the fields for this document
 const potionsCategoryData = {};

 // Add each potions item as a field inside the document
 items.forEach((item, index) => {
 potionsCategoryData[`potions_${index + 1}`] = item;  // Customize the field naming convention
 });
 
// Upload the category data to Firestore
 await docRef.set(potionsCategoryData);

 console.log(`Successfully uploaded ${category} from ${filePath}`);
 }
 
 } catch (error) {
 console.error(`Error uploading potions from ${filePath}:`, error);
 }
}

// Bulk upload function
async function bulkUploadpotions() {
 try {
 const filePath = path.join(__dirname, potionsFile); // Construct the file path
  await uploadpotionsFromFile(filePath);  // Upload data from potions.json

 console.log('potions uploaded successfully!');
 
 } catch (error) {
 console.error('Error during potions bulk upload:', error);
 }
}

// Call the bulk upload function
bulkUploadpotions();

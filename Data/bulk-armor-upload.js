const admin = require('firebase-admin');
const { serviceAccountPath } = require('./config');  // Import the service account path from config.js
const fs = require('fs').promises;
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);  // Use the path from the config
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore instance
const db = admin.firestore();

// Armor file
const armorFile = 'armor.json';

// Function to upload armor data from a file
async function uploadArmorFromFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');  // Read the JSON file
    const armorData = JSON.parse(data);                 // Parse the JSON content

    const collectionRef = db.collection('Armor');  // Reference 'Armor' collection

    // Iterate over each armor category (e.g., Plate, Leather, Shields)
    for (const [category, items] of Object.entries(armorData)) {
      const docRef = collectionRef.doc(category);   // Each category as a document
      
      // Create an object to hold the fields for this document
      const armorCategoryData = {};
      
      // Add each armor item as a field inside the document
      items.forEach((item, index) => {
        armorCategoryData[`armor_${index + 1}`] = item;  // Customize the field naming convention
      });
      
      // Upload the category data to Firestore
      await docRef.set(armorCategoryData);
      
      console.log(`Successfully uploaded ${category} from ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error uploading armor from ${filePath}:`, error);
  }
}

// Bulk upload function
async function bulkUploadArmor() {
  try {
    const filePath = path.join(__dirname, armorFile);  // Construct the file path
    await uploadArmorFromFile(filePath);               // Upload data from armor.json

    console.log('Armor uploaded successfully!');
    
  } catch (error) {
    console.error('Error during armor bulk upload:', error);
  }
}

// Call the bulk upload function
bulkUploadArmor();

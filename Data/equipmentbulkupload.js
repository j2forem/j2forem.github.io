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

// General Equipment file
const generalEquipmentFile = 'equipment_data.json';

// Function to upload general equipment data from a file
async function uploadGeneralEquipmentFromFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');  // Read the JSON file
    const equipmentData = JSON.parse(data);             // Parse the JSON content

    const collectionRef = db.collection('GeneralEquipment');  // Reference 'GeneralEquipment' collection

    // Iterate over each document (e.g., Clothing, FoodAndLodging)
    for (const [document, items] of Object.entries(equipmentData)) {
      const docRef = collectionRef.doc(document);   // Each document (e.g., Clothing, FoodAndLodging)
      
      // Create an object to hold the fields for this document
      const equipmentDocumentData = {};
      
      // Add each equipment item as a field inside the document
      items.forEach((item, index) => {
        equipmentDocumentData[`item_${index + 1}`] = item;  // Customize the field naming convention
      });
      
      // Upload the document data to Firestore
      await docRef.set(equipmentDocumentData);
      
      console.log(`Successfully uploaded ${document} from ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error uploading general equipment from ${filePath}:`, error);
  }
}

// Bulk upload function
async function bulkUploadGeneralEquipment() {
  try {
    const filePath = path.join(__dirname, generalEquipmentFile);  // Construct the file path
    await uploadGeneralEquipmentFromFile(filePath);               // Upload data from generalEquipment.json

    console.log('General Equipment uploaded successfully!');
    
  } catch (error) {
    console.error('Error during general equipment bulk upload:', error);
  }
}

// Call the bulk upload function
bulkUploadGeneralEquipment();


const admin = require('firebase-admin');
const fs = require('fs').promises;  // Node.js 'fs' module to read JSON files
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('C:\\Users\\User\\Documents\\Take Two\\weekendweebz-firebase-adminsdk-3ip3p-8bf8899cd9.json');  // Replace with the path to your Firebase Admin SDK JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore instance
const db = admin.firestore();

// Define the path to the JSON files
const fileNames = {
  FancyToPreciousStones: 'fancytoprecious.json',
  GemsAndJewels: 'gemsandjewels.json',
  SemiPreciousStones: 'semipreciousstones.json',
  OrnamentalStones: 'ornamentalstones.json'
};

// Function to upload gemstone data from a file
async function uploadGemstonesFromFile(category, filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8'); // Read the JSON file
    const gemstones = JSON.parse(data);                // Parse the JSON content

    const docRef = db.collection('gems').doc(category); // Create or reference the document by category

    // Upload gemstone data as fields
    const gemsData = {};
    gemstones[category].forEach((gem, index) => {
      gemsData[`gemstone_${index + 1}`] = gem;  // Create fields for each gemstone
    });

    // Upload to Firestore
    await docRef.set(gemsData);
    console.log(`Successfully uploaded ${category} from ${filePath}`);
    
  } catch (error) {
    console.error(`Error uploading ${category} from ${filePath}:`, error);
  }
}

// Bulk upload function
async function bulkUploadGemstones() {
  try {
    const uploadPromises = [];

    // Iterate over each category and its associated file
    for (const [category, fileName] of Object.entries(fileNames)) {
      const filePath = path.join(__dirname, fileName);  // Construct the file path
      uploadPromises.push(uploadGemstonesFromFile(category, filePath));  // Upload gemstones from each file
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    console.log('All gemstones uploaded successfully!');
    
  } catch (error) {
    console.error('Error during bulk upload:', error);
  }
}

// Call the bulk upload function
bulkUploadGemstones();

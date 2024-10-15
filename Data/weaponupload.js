const admin = require('firebase-admin');
const { serviceAccountPath } = require('./config');  // Import the service account path from config.js
const fs = require('fs').promises;
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);  // Use the path from the config
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// A function to bulk upload JSON data to Firestore
async function uploadWeaponsData(collection, jsonFiles) {
  try {
    for (let file of jsonFiles) {
      const data = await fs.readFile(file, 'utf8');
      const items = JSON.parse(data);

      // Get the document name from the file name (remove .json extension)
      const documentName = file.split('/').pop().replace('.json', '');

      // Upload each set of items to Firestore
      await db.collection(collection).doc(documentName).set(items);
      console.log(`Successfully uploaded ${documentName} to ${collection}`);
    }
  } catch (error) {
    console.error(`Error uploading data: ${error}`);
  }
}

// Main function to start the upload
(async () => {
  const jsonFiles = [
    'Swords.json',
    'AxesAndPicks.json',
    'BluntWeapons.json',
    'Polearms.json',
    'RangedWeapons.json',
    'Ammunition.json'
  ];

  await uploadWeaponsData('Weapons', jsonFiles);
})();

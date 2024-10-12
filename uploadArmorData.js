const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./armor_data.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const uploadArmorData = async () => {
  console.log('Starting data upload...');  // Add this for debugging

  const batch = db.batch();
  const collectionRef = db.collection('Armor');

  data.forEach((item) => {
    const docRef = collectionRef.doc();
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log('Armor data uploaded to Firestore successfully!');  // Success
};

uploadArmorData().catch((error) => {
  console.error('Error uploading armor data:', error);  // Log any error
});


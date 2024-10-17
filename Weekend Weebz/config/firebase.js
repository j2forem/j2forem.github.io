// firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, doc, getDocs, getDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';


// Your Firebase configuration object (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAeSSRmlA-pYs_DOIGvgm4fdVZID6uFUIs",
  authDomain: "weekendweebz.firebaseapp.com",
  projectId: "weekendweebz",
  storageBucket: "weekendweebz.appspot.com",
  messagingSenderId: "389932072090",
  appId: "1:389932072090:web:104a13fc57762a449b3323",
  measurementId: "G-552DK30WLJ"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



// Migration function to update armor fields in subcollections
async function updateArmorItems() {
    try {
        console.log("Starting migration...");

        // Reference the migration flag document
        const migrationDocRef = doc(db, 'migrations', 'armorFieldsMigration');
        const migrationSnapshot = await getDoc(migrationDocRef);

        // Check if migration has already been completed
        if (migrationSnapshot.exists() && migrationSnapshot.data().status === 'complete') {
            console.log('Migration already completed. No need to run.');
            return;
        }

        // Get all documents in the 'Armors' collection (e.g., Chain, Leather, etc.)
        const armorsCollectionRef = collection(db, 'Armors');
        const armorsSnapshot = await getDocs(armorsCollectionRef);

        // If the collection is empty, log an error
        if (armorsSnapshot.empty) {
            console.error("No documents found in the Armors collection!");
            return;
        }

        // Loop through each armor document (e.g., "Chain", "Leather", etc.)
        for (const armorDoc of armorsSnapshot.docs) {
            const armorName = armorDoc.id;  // Document ID (e.g., "Chain", "Leather")
            console.log(`Processing armor category: ${armorName}`);

            // Fetch the subcollection 'Items' under each armor document
            const itemsSubcollectionRef = collection(db, `Armors/${armorName}/Items`);
            const itemsSnapshot = await getDocs(itemsSubcollectionRef);

            if (itemsSnapshot.empty) {
                console.log(`No items found in the subcollection for armor: ${armorName}`);
                continue;  // Skip to the next armor category
            }

            // Loop through each item document in the 'Items' subcollection (e.g., "chain_mail")
            for (const itemDoc of itemsSnapshot.docs) {
                const itemData = itemDoc.data();
                console.log(`Processing item: ${itemData.name}`);

                // Convert AC and weight to numbers, if they exist
                const updatedAC = itemData.AC ? parseInt(itemData.AC, 10) : null;
                const updatedWeight = itemData.weight ? parseFloat(itemData.weight) : null;

                // Prepare updated fields
                const updates = {
                    name_lowercase: itemData.name.toLowerCase(),  // Example field: lowercase name
                    magicBonus: itemData.magicBonus || [],  // Default empty array if not present
                    enchantments: itemData.enchantments || [],  // Default empty array if not present
                    enchantable: true,  // Default to true
                    xp: itemData.xp || 0,  // Default XP to 0 if not present
                    lootTableCategory: itemData.lootTableCategory || ""  // Default empty string
                };

                // Conditionally include fields that are present
                if (updatedAC !== null) updates.AC = updatedAC;
                if (updatedWeight !== null) updates.weight = updatedWeight;

                // Update the document in the subcollection
                await updateDoc(itemDoc.ref, updates);
                console.log(`Updated item: ${itemData.name}`);
            }
        }

        // Mark migration as complete in Firestore
        await setDoc(migrationDocRef, { status: 'complete', date: new Date() });
        console.log('Migration completed.');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Call the migration function when the app loads
updateArmorItems();

export { db };
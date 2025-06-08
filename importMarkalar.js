// importMarkalar.js
const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const importData = () => {
  const batch = db.batch();
  const collectionRef = db.collection('boykotMarkalari');
  let counter = 0;

  console.log('CSV dosyası okunuyor ve markalar Firebase\'e yükleniyor...');

  fs.createReadStream('boykot_markalari.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { marka_id, orijinalAdi, gerekce, kategori } = row;
      if (marka_id) {
        const docRef = collectionRef.doc(marka_id);
        batch.set(docRef, { orijinalAdi, gerekce, kategori });
        counter++;
        console.log(`Eklendi: ${orijinalAdi}`);
      }
    })
    .on('end', async () => {
      try {
        await batch.commit();
        console.log(`\nİşlem tamam! Toplam ${counter} marka başarıyla yüklendi.`);
      } catch (error) {
        console.error("Batch commit hatası: ", error);
      }
    });
};

importData();
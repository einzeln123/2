// importGaleri.js

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin SDK'sını başlatıyoruz, eğer zaten başlatılmamışsa.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Bir koleksiyonu silmek için yardımcı fonksiyon
async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    return resolve();
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

const importGalleryData = async () => {
  console.log('Eski "galeri" koleksiyonu siliniyor...');
  await deleteCollection('galeri');
  console.log('Eski koleksiyon başarıyla silindi. Yeni veriler yükleniyor...');

  const galleryRef = db.collection('galeri');
  const photos = [];

  fs.createReadStream('galeri_data.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { aciklama, resimUrl } = row;
      if (aciklama && resimUrl) {
        photos.push({
          aciklama,
          resimUrl,
          tarih: admin.firestore.FieldValue.serverTimestamp() // Yükleme anının zaman damgasını ekler
        });
      }
    })
    .on('end', async () => {
      console.log(`Okunan fotoğraf sayısı: ${photos.length}. Firebase'e yazılıyor...`);
      // Tüm fotoğrafları tek bir batch işlemiyle ekleyelim
      const batch = db.batch();
      photos.forEach(photo => {
        const docRef = galleryRef.doc(); // Her fotoğraf için yeni bir doküman
        batch.set(docRef, photo);
      });

      try {
        await batch.commit();
        console.log('Tüm galeri verileri başarıyla Firebase\'e yüklendi!');
      } catch (error) {
        console.error("Batch commit hatası: ", error);
      }
    });
};

importGalleryData().catch(console.error);

// importKategoriler.js

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Admin anahtarımızı kullanıyoruz
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Bu fonksiyon, bir koleksiyondaki tüm dokümanları siler.
async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(100);

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


const importData = async () => {
  console.log('Eski "kategoriler" koleksiyonu siliniyor...');
  await deleteCollection('kategoriler');
  console.log('Eski koleksiyon silindi. Yeni veriler yükleniyor...');

  const kategorilerMap = {}; // Markaları kategorilere göre gruplamak için boş bir nesne

  fs.createReadStream('kategori_data.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { kategori, marka } = row;
      if (kategori && marka) {
        if (!kategorilerMap[kategori]) {
          kategorilerMap[kategori] = []; // Eğer kategori daha önce görülmediyse, yeni bir dizi oluştur
        }
        kategorilerMap[kategori].push(marka); // Markayı ilgili kategori dizisine ekle
      }
    })
    .on('end', async () => {
      console.log('CSV dosyası okundu. Veriler Firebase\'e yazılıyor...');

      const promises = [];
      for (const kategoriAdi in kategorilerMap) {
        const kategoriData = {
          adi: kategoriAdi,
          markalar: kategorilerMap[kategoriAdi]
        };

        // Her bir kategoriyi Firestore'a yeni bir doküman olarak ekle
        const promise = db.collection('kategoriler').add(kategoriData);
        promises.push(promise);
        console.log(`'${kategoriAdi}' kategorisi ve markaları eklendi.`);
      }

      await Promise.all(promises);
      console.log('Tüm kategoriler başarıyla Firebase\'e yüklendi!');
    });
};

importData().catch(console.error);
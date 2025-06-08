// importDetayliListe.js
const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(100);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}
async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();
  if (snapshot.size === 0) { return resolve(); }
  const batch = db.batch();
  snapshot.docs.forEach((doc) => { batch.delete(doc.ref); });
  await batch.commit();
  process.nextTick(() => { deleteQueryBatch(query, resolve); });
}

const importData = async () => {
  console.log('Eski "detayli_boykot_listesi" koleksiyonu siliniyor...');
  await deleteCollection('detayli_boykot_listesi');
  console.log('Eski koleksiyon silindi. Yeni veriler yükleniyor...');

  const kategorilerMap = {}; 
  fs.createReadStream('detayli_liste.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { kategori, markaAdi, gerekce } = row;
      if (kategori && markaAdi && gerekce) {
        if (!kategorilerMap[kategori]) {
          kategorilerMap[kategori] = []; 
        }
        kategorilerMap[kategori].push({ adi: markaAdi, gerekce: gerekce }); 
      }
    })
    .on('end', async () => {
      console.log('CSV dosyası okundu. Veriler Firebase\'e yazılıyor...');
      const batch = db.batch();
      for (const kategoriAdi in kategorilerMap) {
        const kategoriRef = db.collection('detayli_boykot_listesi').doc(); // Her kategori için yeni doküman
        batch.set(kategoriRef, {
            adi: kategoriAdi,
            markalar: kategorilerMap[kategoriAdi],
            sira: Object.keys(kategorilerMap).indexOf(kategoriAdi) // Sıralama için index
        });
        console.log(`'${kategoriAdi}' kategorisi ve markaları eklendi.`);
      }
      await batch.commit();
      console.log('Tüm detaylı boykot listesi başarıyla Firebase\'e yüklendi!');
    });
};
importData().catch(console.error);
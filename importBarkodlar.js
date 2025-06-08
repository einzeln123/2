// importBarkodlar.js

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// serviceAccountKey.json dosyanızın proje ana klasöründe olduğundan emin olun.
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin SDK'sını başlatıyoruz.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const barkodlarCollection = db.collection('barkodlar');
const batchSize = 100; // Tek seferde kaç adet yazılacağı
let batch = db.batch();
let commitCounter = 0;

console.log('CSV dosyası okunuyor...');

fs.createReadStream('barkod_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    try {
      const barkod = row.barkod;
      if (barkod) {
        // Doküman ID'si olarak barkodu kullanarak Firestore'a veriyi yazıyoruz.
        const docRef = barkodlarCollection.doc(barkod);
        batch.set(docRef, {
          markaAdi: row.markaAdi,
          urunAdi: row.urunAdi,
          durum: row.durum
        });

        commitCounter++;
        
        // Belirli bir boyuta ulaşınca batch'i commit'le ve yenisini başlat
        if (commitCounter >= batchSize) {
          console.log(`${commitCounter} adet veri commit ediliyor...`);
          batch.commit();
          batch = db.batch();
          commitCounter = 0;
        }
      }
    } catch (error) {
      console.error(`Hata oluştu: ${row.urunAdi}`, error);
    }
  })
  .on('end', () => {
    // Kalan son verileri de commit'le
    if (commitCounter > 0) {
      console.log(`Kalan son ${commitCounter} adet veri commit ediliyor...`);
      batch.commit().then(() => {
        console.log('CSV dosyası başarıyla işlendi ve tüm barkodlar Firebase\'e yüklendi!');
      });
    } else {
        console.log('CSV dosyası başarıyla işlendi ve tüm barkodlar Firebase\'e yüklendi!');
    }
  });

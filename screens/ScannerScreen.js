// screens/ScannerScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Dimensions, TextInput, Keyboard, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import firestore from '@react-native-firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import useNetworkStatus from '../hooks/useNetworkStatus';

const { width, height } = Dimensions.get('window');
const viewfinderWidth = width * 0.8;
const viewfinderHeight = height * 0.25;
const viewfinderY = (height - viewfinderHeight) / 2;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isQuerying, setIsQuerying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const isConnected = useNetworkStatus();

  // --- YENİ VE AKILLI SORGULAMA FONKSİYONU ---
  const queryBarcode = async (barcode) => {
    const trimmedBarcode = typeof barcode === 'string' ? barcode.trim() : '';
    if (!trimmedBarcode || isQuerying) return;
    
    Keyboard.dismiss();
    setIsQuerying(true);
    setScanResult(null);
    setError(null);

    if (!isConnected) {
      setError('Lütfen internet bağlantınızı kontrol edin.');
      setIsQuerying(false);
      return;
    }
    
    try {
      // 1. ADIM: Dış API'den ürün bilgisini çek
      console.log(`Open Food Facts API'si sorgulanıyor: ${trimmedBarcode}`);
      const apiResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${trimmedBarcode}?fields=brands,product_name_tr,product_name`);
      const productData = await apiResponse.json();

      if (productData.status !== 1 || !productData.product?.brands) {
        setScanResult({ durum: 'api_bulunamadi' });
        setIsQuerying(false);
        return;
      }
      
      // 2. ADIM: Marka adını al ve Firebase'de sorgula
      const brandName = productData.product.brands.split(',')[0].trim();
      const productName = productData.product.product_name_tr || productData.product.product_name || '';
      const brandId = brandName.toLowerCase().replace(/ /g, '-'); // "Coca Cola" -> "coca-cola"

      console.log(`Marka bulundu: ${brandName}. Firebase sorgulanıyor...`);
      const brandDoc = await firestore().collection('boykotMarkalari').doc(brandId).get();

      if (brandDoc.exists) {
        setScanResult({
          durum: 'boykot',
          markaAdi: brandName,
          urunAdi: productName,
        });
      } else {
        setScanResult({
          durum: 'güvenli',
          markaAdi: brandName,
          urunAdi: productName,
        });
      }
    } catch (e) {
      console.error("Akıllı sorgu hatası: ", e);
      setError('Sorgulama sırasında bir sorun oluştu.');
    } finally {
      setIsQuerying(false);
    }
  };
  
  const handleBarCodeScanned = ({ data }) => {
    if (!isQuerying && !scanResult && !error) {
      queryBarcode(data);
    }
  };

  const handleManualSearch = () => {
    queryBarcode(manualBarcode);
  };
  
  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setManualBarcode('');
  };
  
  if (!permission) { return <View style={styles.container}><ActivityIndicator size="large" color="#fff" /></View>; }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Barkod taramak için kamera izninize ihtiyacımız var.</Text>
        <Button onPress={requestPermission} title="Kamera İçin İzin Ver" color="#c0392b" />
      </View>
    );
  }

  const renderResultBox = () => {
    if (error) { return <View style={[styles.resultBox, styles.notFoundBox]}><Ionicons name="warning-outline" size={48} color="white" /><Text style={styles.resultText}>{error}</Text></View>; }
    if (scanResult) {
      switch (scanResult.durum) {
        case 'boykot':
          return <View style={[styles.resultBox, styles.boycottBox]}><Ionicons name="close-circle" size={48} color="white" /><Text style={styles.resultText}>BOYKOT LİSTESİNDE</Text><Text style={styles.brandText}>{scanResult.markaAdi} - {scanResult.urunAdi}</Text></View>;
        case 'güvenli':
          return <View style={[styles.resultBox, styles.safeBox]}><Ionicons name="checkmark-circle" size={48} color="white" /><Text style={styles.resultText}>GÜVENLİ GÖRÜNÜYOR</Text><Text style={styles.brandText}>{scanResult.markaAdi} - {scanResult.urunAdi}</Text></View>;
        case 'api_bulunamadi':
          return <View style={[styles.resultBox, styles.notFoundBox]}><Ionicons name="help-circle" size={48} color="white" /><Text style={styles.resultText}>BARKOD TANINAMADI</Text></View>;
        default:
          return <View style={[styles.resultBox, styles.notFoundBox]}><Ionicons name="alert-circle-outline" size={48} color="white" /><Text style={styles.resultText}>BİLİNMEYEN SONUÇ</Text></View>;
      }
    }
    return null;
  };
  
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.mask} />
        <View style={styles.viewfinderContainer}>
          <View style={styles.mask} />
          <View style={styles.viewfinder} />
          <View style={styles.mask} />
        </View>
        <View style={styles.mask} />
      </View>

      {!isQuerying && !scanResult && !error && (
        <>
          <Text style={styles.instructionText}>Barkodu dikdörtgen alanın içine getirin</Text>
          <View style={styles.manualInputContainer}>
            <TextInput style={styles.manualInput} placeholder="Veya barkodu elle girin" placeholderTextColor="#aaa" keyboardType="numeric" value={manualBarcode} onChangeText={setManualBarcode}/>
            <TouchableOpacity style={styles.manualButton} onPress={handleManualSearch}><Text style={styles.manualButtonText}>Sorgula</Text></TouchableOpacity>
          </View>
        </>
      )}

      {(isQuerying || scanResult || error) && (
        <View style={styles.resultContainer}>
          {isQuerying ? (
            <View><ActivityIndicator size="large" color="#fff" /><Text style={[styles.resultText, { marginTop: 20 }]}>Sorgulanıyor...</Text></View>
          ) : (
            <>{renderResultBox()}<TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}><Text style={styles.scanAgainText}>{error ? 'Tekrar Dene' : 'Yeni Barkod Tara'}</Text></TouchableOpacity></>
          )}
        </View>
      )}
    </View>
  );
}

// Stiller öncekiyle aynı, sadece kopyalayıp yapıştırın.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  infoText: { color: 'white', fontSize: 18, textAlign: 'center', padding: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  mask: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  viewfinderContainer: { flexDirection: 'row', height: viewfinderHeight },
  viewfinder: { width: viewfinderWidth, height: viewfinderHeight, borderWidth: 2, borderColor: '#c0392b', borderRadius: 10 },
  instructionText: { position: 'absolute', top: viewfinderY + viewfinderHeight + 20, color: 'white', fontSize: 16, textAlign: 'center', width: '100%', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
  manualInputContainer: { position: 'absolute', bottom: 40, width: '90%', alignSelf: 'center', backgroundColor: 'rgba(44, 44, 44, 0.9)', borderRadius: 10, padding: Platform.OS === 'ios' ? 10 : 0, flexDirection: 'row', alignItems: 'center' },
  manualInput: { flex: 1, color: 'white', fontSize: 16, padding: 10 },
  manualButton: { backgroundColor: '#c0392b', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginRight: Platform.OS === 'android' ? 5 : 0 },
  manualButtonText: { color: 'white', fontWeight: 'bold' },
  resultContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', padding: 30, alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  resultBox: { width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  boycottBox: { backgroundColor: '#c0392b' },
  safeBox: { backgroundColor: '#27ae60' },
  notFoundBox: { backgroundColor: '#6c757d' },
  resultText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  brandText: { color: 'white', fontSize: 16, marginTop: 5, textAlign: 'center' },
  scanAgainButton: { backgroundColor: 'white', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  scanAgainText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
});

// screens/HelpScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HelpScreen() {
  const [kuruluslar, setKuruluslar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('yardimKuruluslari')
      .orderBy('sira', 'asc') // Kurumları belirlediğimiz sıraya göre diz
      .onSnapshot(querySnapshot => {
        const kurulusListesi = [];
        querySnapshot.forEach(documentSnapshot => {
          kurulusListesi.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setKuruluslar(kurulusListesi);
        setYukleniyor(false);
      });

    return () => unsubscribe();
  }, []);

  // --- YENİ ÖĞRENECEĞİMİZ KISIM: LİNKE GİTME FONKSİYONU ---
  const openUrl = async (url) => {
    // Cihazın bu linki açıp açamayacağını kontrol et
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Eğer açabiliyorsa, linki cihazın varsayılan tarayıcısında aç
      await Linking.openURL(url);
    } else {
      // Eğer bir sorun olursa kullanıcıyı uyar
      Alert.alert(`Bu link açılamıyor: ${url}`);
    }
  };

  if (yukleniyor) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#c0392b" />
      </View>
    );
  }

  // Her bir yardım kuruluşunu gösteren kart
  const KurulusKarti = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openUrl(item.link)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.isim}</Text>
        <Text style={styles.cardText}>{item.aciklama}</Text>
      </View>
      <Ionicons name="open-outline" size={24} color="#c0392b" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={kuruluslar}
      renderItem={KurulusKarti}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Nasıl Destek Olabilirim?</Text>
            <Text style={styles.headerText}>
                Aşağıdaki güvenilir kurumlar aracılığıyla Filistin halkına doğrudan yardım ulaştırabilirsiniz. Yapacağınız her katkı, bir yarayı sarmak için umuttur.
            </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});
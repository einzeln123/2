// screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Filistin İçin Vicdan Hareketi</Text>
        <Text style={styles.subtitle}>Sessiz kalma, bilinçli tercihlerle değişimin bir parçası ol.</Text>
      </View>

      <View style={styles.cardContainer}>
        
        {/* ✅ YENİ EKLENEN DİKKAT ÇEKİCİ KART */}
        <TouchableOpacity style={[styles.card, styles.scanCard]} onPress={() => navigateToScreen('Tara')}>
          <Ionicons name="barcode-outline" size={40} color="#fff" />
          <Text style={[styles.cardTitle, styles.scanCardTitle]}>Barkod Tara</Text>
          <Text style={styles.scanCardText}>Bir ürünün durumunu anında öğrenin.</Text>
        </TouchableOpacity>

        {/* Mevcut Yönlendirme Kartları */}
        <TouchableOpacity style={styles.card} onPress={() => navigateToScreen('Boykot')}>
          <Ionicons name="list-outline" size={32} color="#c0392b" />
          <Text style={styles.cardTitle}>Boykot Listesi</Text>
          <Text style={styles.cardText}>Markaları ve gerekçelerini incele.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateToScreen('Haberler')}>
          <Ionicons name="newspaper-outline" size={32} color="#c0392b" />
          <Text style={styles.cardTitle}>Güncel Haberler</Text>
          <Text style={styles.cardText}>Filistin'den son gelişmeleri takip et.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateToScreen('Galeri')}>
          <Ionicons name="images-outline" size={32} color="#c0392b" />
          <Text style={styles.cardTitle}>Zulme Tanıklık</Text>
          <Text style={styles.cardText}>Yaşananları gösteren fotoğraf galerisi.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigateToScreen('Yardım Et')}>
          <Ionicons name="heart-outline" size={32} color="#c0392b" />
          <Text style={styles.cardTitle}>Destek Ol</Text>
          <Text style={styles.cardText}>Bağış ve gönüllülük yollarını keşfet.</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#111',
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 8,
  },
  cardContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  // ✅ YENİ EKLENEN STİLLER
  scanCard: {
    backgroundColor: '#c0392b',
    alignItems: 'center',
    paddingVertical: 30,
    borderColor: '#e74c3c'
  },
  scanCardTitle: {
    color: '#fff',
    fontSize: 24,
  },
  scanCardText: {
    color: '#eee',
    fontSize: 16,
  }
});

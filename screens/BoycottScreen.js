// screens/BoycottScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import useNetworkStatus from '../hooks/useNetworkStatus';

// Akordiyon menüdeki her bir marka için oluşturulacak bileşen
const MarkaItem = ({ marka }) => {
  const [expanded, setExpanded] = useState(false); // Bu marka genişletildi mi?

  return (
    <View style={styles.markaContainer}>
      <TouchableOpacity 
        style={styles.markaHeader} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.markaText}>{marka.adi}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#e0e0e0" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.gerekceContainer}>
          <Text style={styles.gerekceText}>{marka.gerekce}</Text>
        </View>
      )}
    </View>
    
    
  );
};


export default function BoycottScreen() {
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hataMesaji, setHataMesaji] = useState('');
  const isConnected = useNetworkStatus();

  useEffect(() => {
    const fetchKategoriler = async () => {
      setHataMesaji('');
      setYukleniyor(true);

      if (!isConnected) {
        setHataMesaji('Lütfen internet bağlantınızı kontrol edin.');
        setYukleniyor(false);
        return;
      }
      try {
        const kategoriListesi = [];
        const snapshot = await firestore().collection('detayli_boykot_listesi').orderBy('sira', 'asc').get();
        snapshot.forEach(doc => {
          kategoriListesi.push({ id: doc.id, ...doc.data() });
        });
        setKategoriler(kategoriListesi);
      } catch (error) {
        setHataMesaji('Veriler yüklenirken bir sorun oluştu.');
      } finally {
        setYukleniyor(false);
      }
    };
    fetchKategoriler();
  }, [isConnected]);

  if (yukleniyor) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#c0392b" /></View>;
  }
  if (hataMesaji) {
    return <View style={styles.centerContainer}><Text style={styles.hataText}>{hataMesaji}</Text></View>;
  }
  if (!yukleniyor && kategoriler.length === 0) {
    return <View style={styles.centerContainer}><Ionicons name="alert-circle-outline" size={60} color="#6c757d" /><Text style={styles.hataText}>Boykot Listesi Boş.</Text></View>;
  }

  const renderKategori = ({ item: kategori }) => (
    <View style={styles.kategoriContainer}>
      <Text style={styles.kategoriTitle}>{kategori.adi}</Text>
      {kategori.markalar.map((marka, index) => (
        <MarkaItem key={index} marka={marka} />
      ))}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={kategoriler}
      renderItem={renderKategori}
      keyExtractor={item => item.id}
      ListHeaderComponent={<Text style={styles.headerTitle}>Bilgilendirilmiş Boykot</Text>}
    />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a1a' },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', padding: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 20 },
    hataText: { fontSize: 18, fontWeight: 'bold', color: '#e0e0e0', marginTop: 15, textAlign: 'center' },
    kategoriContainer: { marginHorizontal: 15, marginBottom: 20 },
    kategoriTitle: { fontSize: 22, fontWeight: 'bold', color: '#c0392b', marginBottom: 10, paddingBottom: 5 },
    markaContainer: {
        backgroundColor: '#2c2c2c',
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    markaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    markaText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    gerekceContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#444',
        marginTop: 10
    },
    gerekceText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        paddingTop: 10
    }
});

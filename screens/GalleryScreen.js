import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ImageView from "react-native-image-viewing";
import Ionicons from '@expo/vector-icons/Ionicons';
import useNetworkStatus from '../hooks/useNetworkStatus';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const [resimler, setResimler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  
  const [seciliIndex, setSeciliIndex] = useState(0);
  const [gostericiGorunur, setGostericiGorunur] = useState(false);
  
  const isConnected = useNetworkStatus();

  useEffect(() => {
    const fetchResimler = async () => {
      setHata(null);
      setYukleniyor(true);

      if (!isConnected) {
        setHata('Lütfen internet bağlantınızı kontrol edin.');
        setYukleniyor(false);
        return;
      }
      
      try {
        const resimListesi = [];
        const snapshot = await firestore().collection('galeri').orderBy('tarih', 'desc').get();
        
        snapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          resimListesi.push({
            id: documentSnapshot.id,
            uri: data.resimUrl,
            aciklama: data.aciklama,
            tarih: data.tarih,
          });
        });

        if (resimListesi.length > 0) {
          setResimler(resimListesi);
        } else {
          setHata('Henüz galeriye resim eklenmedi.');
        }

      } catch (error) {
        console.error("Galeri çekilirken hata: ", error);
        setHata('Galeri yüklenirken bir sorun oluştu.');
      } finally {
        setYukleniyor(false);
      }
    };

    fetchResimler();
  }, [isConnected]);

  const resmiAc = (index) => {
    setSeciliIndex(index);
    setGostericiGorunur(true);
  };

  const resmiKapat = () => {
    setGostericiGorunur(false);
  };

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#c0392b" />
      </View>
    );
  }

  if (hata) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#6c757d" />
        <Text style={styles.hataText}>{hata}</Text>
      </View>
    );
  }

  const ResimKaresi = ({ item, index }) => (
    <TouchableOpacity style={styles.imageContainer} onPress={() => resmiAc(index)}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageView
        images={resimler.map(r => ({ uri: r.uri }))}
        imageIndex={seciliIndex}
        visible={gostericiGorunur}
        onRequestClose={resmiKapat}
      />

      <FlatList
        data={resimler}
        renderItem={ResimKaresi}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View>
            <Text style={styles.headerTitle}>Zulme Tanıklık</Text>
            <Text style={styles.headerSubtitle}>"Unutursak kalbimiz kurusun."</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  hataText: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
    marginTop: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#aaa',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  imageContainer: {
    width: width / 2,
    height: width / 2,
    padding: 2,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
});

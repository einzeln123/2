import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import useNetworkStatus from '../hooks/useNetworkStatus';
import Ionicons from '@expo/vector-icons/Ionicons';

// Tarih formatını daha okunabilir hale getiren bir yardımcı fonksiyon
const formatDate = (isoDate) => {
  if (!isoDate) return 'Tarih bilgisi yok';
  const date = new Date(isoDate);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function NewsScreen() {
  const [haberler, setHaberler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const isConnected = useNetworkStatus();

  const API_KEY = '40bf6df679e04bcdbdb80c691abe07be'; 

  useEffect(() => {
    const fetchHaberler = async () => {
      setHata(null);
      setYukleniyor(true);

      if (!isConnected) {
        setHata('Lütfen internet bağlantınızı kontrol edin.');
        setYukleniyor(false);
        return;
      }

      try {
        const query = encodeURIComponent('filistin OR gazze OR israil OR kudüs');
        const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=tr&sortBy=publishedAt&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status === "ok") {
          // 🔎 Burada filtreleme işlemi yapılır
          const filtreli = data.articles.filter(article => {
            const combinedText = `${article.title} ${article.description} ${article.content}`.toLowerCase();
            return combinedText.includes('filistin') ||
                   combinedText.includes('gazze') ||
                   combinedText.includes('israil') ||
                   combinedText.includes('refah') ||
                   combinedText.includes('netanyahu') ||
                   combinedText.includes('kudüs') ||
                   combinedText.includes('hamas');
          });

          if (filtreli.length > 0) {
            setHaberler(filtreli);
          } else {
            setHata('Bu konuda şu an için yeni bir haber bulunamadı.');
          }
        } else {
          setHata(data.message || 'Haberler alınamadı. API anahtarınızı kontrol edin.');
        }
      } catch (error) {
        console.error("Haber API hatası:", error);
        setHata('Haberler yüklenirken bir sorun oluştu.');
      } finally {
        setYukleniyor(false);
      }
    };

    fetchHaberler();
  }, [isConnected]);

  const openUrl = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Bu link açılamıyor: ${url}`);
    }
  };

  if (yukleniyor) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#c0392b" /></View>;
  }

  if (hata) {
    return <View style={styles.centerContainer}><Ionicons name="alert-circle-outline" size={60} color="#6c757d" /><Text style={styles.hataText}>{hata}</Text></View>;
  }

  const HaberKarti = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openUrl(item.url)}>
      {item.urlToImage ? (
        <Image source={{ uri: item.urlToImage }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={50} color="#555" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>{item.source.name} - {formatDate(item.publishedAt)}</Text>
        <Text style={styles.cardSummary}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={haberler}
      renderItem={HaberKarti}
      keyExtractor={(item, index) => item.url + index}
      ListHeaderComponent={<Text style={styles.headerTitle}>Güncel Gelişmeler</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  hataText: { fontSize: 18, color: '#e0e0e0', textAlign: 'center', marginTop: 15 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', padding: 20 },
  card: { backgroundColor: '#2c2c2c', borderRadius: 12, marginHorizontal: 15, marginBottom: 15, overflow: 'hidden' },
  cardImage: { width: '100%', height: 200 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  cardDate: { fontSize: 12, color: '#aaa', marginBottom: 10 },
  cardSummary: { fontSize: 14, color: '#e0e0e0', lineHeight: 20 },
});

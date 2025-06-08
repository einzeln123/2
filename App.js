// App.js
import React from 'react';
import { View } from 'react-native'; // ✅ EKSİK OLAN IMPORT EKLENDİ
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Ekranlarımızı import ediyoruz
import HomeScreen from './screens/HomeScreen';
import BoycottScreen from './screens/BoycottScreen';
import NewsScreen from './screens/NewsScreen';
import GalleryScreen from './screens/GalleryScreen';
import HelpScreen from './screens/HelpScreen';
import ScannerScreen from './screens/ScannerScreen'; // ScannerScreen'i import etmeyi unutmayın

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Her sekme için bir ikon belirleme
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Ana Sayfa') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Boykot') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Haberler') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Galeri') {
              iconName = focused ? 'images' : 'images-outline';
            } else if (route.name === 'Yardım Et') {
              iconName = focused ? 'heart' : 'heart-outline';
            }

            // Ortadaki "Tara" ikonunu daha büyük ve dikkat çekici yapalım
            if (route.name === 'Tara') {
              return (
                // ✅ GÜNCELLENMİŞ STİL: İkonu mükemmel bir daire içine alıp daha estetik hale getirdik.
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 35, // Genişliğin/yüksekliğin yarısı
                  backgroundColor: '#c0392b',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bottom: 10, // Yükseltme miktarı
                  shadowColor: '#c0392b',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 8,
                  borderWidth: 3,
                  borderColor: '#1a1a1a'
                }}>
                  <Ionicons name="barcode-sharp" size={32} color="#fff" />
                </View>
              );
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // Sekme çubuğunun renk ve stil ayarları
          tabBarStyle: { 
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
            height: 60, // Sabit bir yükseklik verelim
            paddingBottom: 5 // İkonların alttan boşluğu
          },
          tabBarActiveTintColor: '#c0392b',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: route.name !== 'Tara', // Tara sekmesinin yazısını gizle
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
        })}
      >
        {/* Sekmelerimizi ve hangi ekranı göstereceklerini tanımlıyoruz */}
        <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
        <Tab.Screen name="Boykot" component={BoycottScreen} />
        <Tab.Screen name="Tara" component={ScannerScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Haberler" component={NewsScreen} />
        <Tab.Screen name="Galeri" component={GalleryScreen} />
        <Tab.Screen name="Yardım Et" component={HelpScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/*import { View, Text, StyleSheet, TextInput, Dimensions, StatusBar, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Location from 'expo-location';
import { FIRESTORE_DB } from '../Firebase'; // Adjust the import according to your Firebase config file
import { collection, getDocs } from 'firebase/firestore';
import ServiceProviderCard from '../components/ServiceProviderCard'; // Adjust the import if needed

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

// Haversine formula to calculate distance between two coordinates
const haversineDistance = (coords1, coords2) => {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const earthRadius = 6371; // Radius of the Earth in km

  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(coords1.latitude)) * Math.cos(toRadians(coords2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c; // Distance in km
};

const Home = ({ navigation }) => { // Make sure to destructure navigation prop here
  
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      if (userLocation) {
        try {
          const snapshot = await getDocs(collection(FIRESTORE_DB, 'providers'));
          const providersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedProviders = providersList
            .map(provider => ({
              ...provider,
              distance: haversineDistance(userLocation, {
                latitude: provider.latitude,
                longitude: provider.longitude,
              })
            }))
            .sort((a, b) => a.distance - b.distance);

          setProviders(sortedProviders);
        } catch (error) {
          console.error('Error fetching providers:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProviders();
  }, [userLocation]);

  const handleProviderTap = (provider) => {
    Alert.alert(
      "Start Chat",
      `Do you want to chat with ${provider.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Chat",
          onPress: () => {
            navigation.navigate('ChatRoom', { providerId: provider.id }); // Pass the provider ID here
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder='Search for Services'
        placeholderTextColor={'gray'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#179139" />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ServiceProviderCard 
              provider={item} 
              navigation={navigation} // Pass the navigation prop to the card
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Height * 0.1,
  },
  search: {
    borderColor: 'black',
    borderWidth: 1,
    width: Width * 0.8,
    height: Height * 0.05,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignSelf: 'center',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Home;
*/

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  PanResponder,
  Animated,
  Image
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { FIRESTORE_DB } from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

// Haversine formula
const haversineDistance = (coords1, coords2) => {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const earthRadius = 6371;

  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.latitude)) *
      Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const Home = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const pan = useRef(new Animated.ValueXY({ x: Width - 70, y: Height - 170 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: pan.x._value, y: pan.y._value },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      if (userLocation) {
        try {
          const snapshot = await getDocs(collection(FIRESTORE_DB, 'providers'));
          const providersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedProviders = providersList
            .map(provider => ({
              ...provider,
              distance: haversineDistance(userLocation, {
                latitude: provider.latitude,
                longitude: provider.longitude,
              }),
            }))
            .sort((a, b) => a.distance - b.distance);

          setProviders(sortedProviders);
        } catch (error) {
          console.error('Error fetching providers:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProviders();
  }, [userLocation]);

  const handleProviderTap = (provider) => {
    Alert.alert(
      'Start Chat',
      `Do you want to chat with ${provider.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Chat',
          onPress: () => navigation.navigate('ChatRoom', { providerId: provider.id }),
        },
      ]
    );
  };

  const renderProviderCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleProviderTap(item)} style={styles.card}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name || 'Sheeshes Glam'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-sharp" size={16} color="#fff" />
          <Text style={styles.cardLocation}>{item.location || 'Adenta'}</Text>
        </View>
        <Text style={styles.cardDescription}>
          {item.description || 'We offer makeup and nail services for any occasion'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TextInput
        style={styles.search}
        placeholder="Search for Services"
        placeholderTextColor={'gray'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item.id}
          renderItem={renderProviderCard}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Floating Movable Support Button */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.supportBtn, pan.getLayout()]}
      >
        <TouchableOpacity onPress={() => Alert.alert("Support", "Contact support here")}>
          <Ionicons name="help-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Height * 0.08,
    backgroundColor: "#fff",
  },
  search: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: Width * 0.9,
    height: Height * 0.06,
    borderRadius: 12,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#005EB8',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  cardLocation: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  cardDescription: {
    color: '#fff',
    marginTop: 6,
    fontSize: 13,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  supportBtn: {
    position: 'absolute',
    backgroundColor: '#005EB8',
    borderRadius: 30,
    padding: 10,
    zIndex: 99,
  },
});

export default Home;
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
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
// 👆 added doc, getDoc, setDoc

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

// helper to create deterministic chatId
const generateChatId = (userId, providerId) => {
  return [userId, providerId].sort().join('_');
};

const Home = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: replace with actual logged-in user id from Firebase Auth
  const userId = "CURRENT_USER_ID";  

  const pan = useRef(new Animated.ValueXY({ x: Width - 70, y: Height - 170 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: (e, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
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
              distance: provider.latitude && provider.longitude
                ? haversineDistance(userLocation, {
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                  })
                : Infinity,
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

  const handleProviderTap = async (provider) => {
    const chatId = generateChatId(userId, provider.id);
    const chatRef = doc(FIRESTORE_DB, "chats", chatId);

    try {
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [userId, provider.id],
          lastMessage: "",
          updatedAt: new Date(),
        });
      }

      navigation.navigate("ChatRoom", { chatId, providerId: provider.id });
    } catch (error) {
      console.error("Error creating/fetching chat:", error);
    }
  };

  const renderProviderCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleProviderTap(item)} style={styles.card}>
      <Image
         source={{
    uri: item.image || 'https://via.placeholder.com/50', // online fallback
  }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.servicename || 'Service Provider'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-sharp" size={16} color="#fff" />
          <Text style={styles.cardLocation}>{item.location || 'Unknown'}</Text>
        </View>
        <View style={styles.serviceTag}>
          <Text style={styles.serviceText}>{item.service || 'Service'}</Text>
        </View>
        <Text style={styles.cardDescription}>
          {item.about || 'No description available'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Apply search filter
  const filteredProviders = providers.filter((provider) =>
    provider.servicename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.location?.toLowerCase().includes(searchQuery.toLowerCase())
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
      ) : filteredProviders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
          No providers found.
        </Text>
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={item => item.id}
          renderItem={renderProviderCard}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Floating Movable Support Button */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.supportBtn, { transform: pan.getTranslateTransform() }]}
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
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: '#005EB8',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  serviceText: {
    color: '#005EB8',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
export default Home;
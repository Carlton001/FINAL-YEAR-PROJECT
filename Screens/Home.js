import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
  Image,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../Firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

// Haversine formula
const haversineDistance = (coords1, coords2) => {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const earthRadius = 6371;
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(coords1.latitude)) *
      Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

// Generate deterministic chatId from two UIDs
const generateChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const Home = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: Width - 70, y: Height - 170 })).current;
  const auth = getAuth();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return unsubscribe;
  }, []);

  // Get user location
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        setLoading(false);
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
    };
    fetchLocation();
  }, []);

  // Fetch providers
  useEffect(() => {
    if (!user || !userLocation) return;

    setLoading(true);
    const providersRef = collection(FIRESTORE_DB, 'providers');
    const unsub = onSnapshot(
      providersRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const sorted = list
          .map((p) => ({
            ...p,
            distance:
              p.latitude && p.longitude
                ? haversineDistance(userLocation, {
                    latitude: p.latitude,
                    longitude: p.longitude,
                  })
                : Infinity,
          }))
          .sort((a, b) => a.distance - b.distance);
        setProviders(sorted);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error('Error fetching providers:', err);
        setLoading(false);
        setRefreshing(false);
      }
    );
    return unsub;
  }, [user, userLocation]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Create or get chat
  const handleProviderTap = async (provider) => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to chat with providers.');
      return;
    }
    if (!provider?.postedById) {
      Alert.alert(
        'Provider not linked',
        'This provider is missing their user UID (postedById). Ask them to re-post their service.'
      );
      return;
    }

    const otherUid = provider.postedById;
    const chatId = generateChatId(user.uid, otherUid);
    const chatRef = doc(FIRESTORE_DB, 'chats', chatId);

    try {
      const snap = await getDoc(chatRef);

      if (!snap.exists()) {
        // Fetch provider displayName from users collection
        let providerName = provider.servicename || provider.name || 'Provider';
        try {
          const providerDoc = await getDoc(doc(FIRESTORE_DB, 'users', otherUid));
          if (providerDoc.exists()) {
            const data = providerDoc.data();
            providerName = `${data.firstName} ${data.lastName}`;
          }
        } catch (err) {
          console.log('Provider user fetch failed, using service name');
        }

        const chatData = {
          participants: [user.uid, otherUid],
          lastMessage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          meta: {
            [user.uid]: { displayName: user.displayName || user.email || 'You' },
            [otherUid]: { displayName: providerName },
          },
        };

        await setDoc(chatRef, chatData);
        console.log('Chat created:', chatId);
      }

      navigation.navigate('ChatRoom', { chatId, provider });
    } catch (e) {
      console.error('Error creating chat:', e);
      Alert.alert('Error', 'Unable to start chat. Please try again.');
    }
  };

  const renderProviderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleProviderTap(item)}>
      <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.servicename || 'Service Provider'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-sharp" size={16} color="#fff" />
          <Text style={styles.cardLocation}>{item.location || 'Unknown'}</Text>
        </View>
        <View style={styles.serviceTag}>
          <Text style={styles.serviceText}>{item.service || 'Service'}</Text>
        </View>
        <Text style={styles.cardDescription}>{item.about || 'No description available'}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredProviders = providers.filter(
    (p) =>
      p.servicename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TextInput
        style={styles.search}
        placeholder="Search for Services"
        placeholderTextColor="gray"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" />
      ) : filteredProviders.length === 0 ? (
        <Text style={styles.noProviders}>No providers found.</Text>
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item.id}
          renderItem={renderProviderCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}

      <Animated.View style={[styles.supportBtn, { transform: pan.getTranslateTransform() }]}>
        <TouchableOpacity onPress={() => Alert.alert('Support', 'Contact support here')}>
          <Ionicons name="help-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Height * 0.08, backgroundColor: '#fff' },
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
  noProviders: { textAlign: 'center', marginTop: 20, color: 'gray' },
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
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#fff', marginBottom: 4 },
  cardLocation: { color: '#fff', marginLeft: 4, fontSize: 14 },
  cardDescription: { color: '#fff', marginTop: 6, fontSize: 13 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd', marginRight: 10 },
  supportBtn: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#005EB8', borderRadius: 30, padding: 10, zIndex: 99 },
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
  serviceText: { color: '#005EB8', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
});

export default Home;

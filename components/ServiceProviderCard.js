import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for location icon
import ChatModal from './ChatModal';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

const ServiceProviderCard = ({ provider, navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handlePress = () => {
    navigation.navigate('ChatRoom', { providerId: provider.id }); // Navigate to ChatRoom
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.inner1}>
        <Text style={styles.distance}>{provider.distance.toFixed(2)} km away</Text>
        <Text style={styles.name}>{provider.name}</Text>
      </View>
      <View style={styles.inner2}>
        <View style={styles.bg}>
          <Ionicons name='location' color='#179139' size={17} />
          <Text style={styles.location}>{provider.location}</Text>
        </View>
        <View style={styles.bg}>
          <Text style={styles.service}>{provider.service}</Text>
        </View>
      </View>

      {/* Chat Modal */}
      <ChatModal
        visible={isModalVisible}
        onClose={closeModal}
        navigation={navigation}
        provider={provider}  // Pass provider details
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Width * 0.85,
    backgroundColor: '#179139', // Card background color
    alignSelf: 'center',
    padding: 20,
    borderRadius: 16,
    margin: Width * 0.04,
  },
  inner1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: Width * 0.5,
    paddingVertical: 15,
  },
  distance: {
    color: '#fff', // Distance text color
  },
  name: {
    color: '#fff', // Service provider name color
    fontSize: 25, // Increased font size for name
  },
  inner2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    color: '#000', // Location text color
    padding: 7,
  },
  service: {
    color: '#000', // Service text color
    padding: 7,
  },
  bg: {
    backgroundColor: '#fff', // Background for the location and service
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Width * 0.05,
  },
});

export default ServiceProviderCard;

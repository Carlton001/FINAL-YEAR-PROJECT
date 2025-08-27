import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

const ServiceProviderCard = ({ provider, navigation }) => {
  const handleOpenChat = () => {
    if (!provider.postedById) {
      console.warn("⚠️ Provider UID missing");
      return;
    }

    navigation.navigate("ChatRoom", { providerId: provider.postedById });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleOpenChat}>
      <View style={styles.inner1}>
        {provider.distance && (
          <Text style={styles.distance}>{provider.distance.toFixed(2)} km away</Text>
        )}
        <Text style={styles.name}>{provider.servicename}</Text>
      </View>
      <View style={styles.inner2}>
        <View style={styles.bg}>
          <Ionicons name="location" color="#179139" size={17} />
          <Text style={styles.location}>{provider.location}</Text>
        </View>
        <View style={styles.bg}>
          <Text style={styles.service}>{provider.service}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Width * 0.85,
    backgroundColor: '#179139',
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
    color: '#fff',
  },
  name: {
    color: '#fff',
    fontSize: 25,
    flexShrink: 1,
  },
  inner2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    color: '#000',
    padding: 7,
  },
  service: {
    color: '#000',
    padding: 7,
  },
  bg: {
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Width * 0.05,
  },
});

export default ServiceProviderCard;

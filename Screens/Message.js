import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
import { FIRESTORE_DB } from '../Firebase'; // Adjust according to your Firebase config file
import { collection, getDocs } from 'firebase/firestore';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

const messages = [
  { id: '1', name: 'Service Provider 1', lastMessage: 'Hello!' },
  { id: '2', name: 'Service Provider 2', lastMessage: 'Let’s discuss further' },
  { id: '3', name: 'Service Provider 3', lastMessage: 'Thank you!' },
];

const MessageScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { name: item.name })}>
            <View style={styles.messageCard}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 70,
  },
  messageCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#888',
    marginTop: 5,
  },
});

export default MessageScreen;
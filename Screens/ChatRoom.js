import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase';
import { Ionicons } from '@expo/vector-icons'; // Icon for back button

const ChatRoom = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleSend = () => {
    if (message.trim() && user) {
      // Logic to send the message, e.g., saving it to Firestore
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatArea}>
        <Text style={styles.placeholderText}>Chat messages will appear here...</Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message"
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  chatArea: {
    flex: 1,
    padding: 10,
  },
  placeholderText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatRoom;

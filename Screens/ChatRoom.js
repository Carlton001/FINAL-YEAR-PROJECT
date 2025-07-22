import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';  // Correctly import from 'firebase/auth'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase'; // Import your Firebase Auth correctly

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

    return unsubscribe;  // Cleanup subscription on unmount
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
      <View style={styles.chatArea}>
        {/* Chat messages will appear here */}
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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  chatArea: {
    flex: 1,
    padding: 10,
    marginTop: 30,
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

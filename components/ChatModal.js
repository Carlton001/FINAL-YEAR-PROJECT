import React, { useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase';

const ChatModal = ({ visible, onClose, navigation, provider }) => {
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    setLoading(true);

    try {
      // get logged in user
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      // make a unique chat id (user1_user2) sorted to avoid duplicates
      const chatId =
        user.uid < provider.id
          ? `${user.uid}_${provider.id}`
          : `${provider.id}_${user.uid}`;

      const chatRef = doc(FIRESTORE_DB, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        // create the chat if it doesn't exist
        await setDoc(chatRef, {
          participants: [user.uid, provider.id],
          lastMessage: "",
          updatedAt: serverTimestamp(),
        });
      }

      // navigate to ChatRoom with chatId
      navigation.navigate("ChatRoom", { chatId, provider });
      onClose();
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={{ marginBottom: 10 }}>
            Chat with {provider?.name || "Provider"}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="blue" />
          ) : (
            <>
              <Button title="Chat" onPress={handleChat} />
              <Button title="Close" onPress={onClose} color="red" />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ChatModal;


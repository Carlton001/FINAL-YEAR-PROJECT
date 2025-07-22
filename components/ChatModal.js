
import React, { useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const ChatModal = ({ visible, onClose, navigation, provider }) => {
    const handleChat = () => {
      // Ensure navigation is available
      if (navigation) {
        navigation.navigate('ChatRoom', { provider });
        onClose(); // Close the modal after navigation
      } else {
        console.error("Navigation prop is not defined");
      }
    };
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Chat with {provider.name}</Text>
            <Button title="Chat" onPress={handleChat} />
            <Button title="Close" onPress={onClose} />
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
  cancelText: {
    color: 'red',
    marginTop: 15,
  },
});

export default ChatModal;

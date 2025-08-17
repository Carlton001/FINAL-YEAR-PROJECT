import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../Firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';

const MessageScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [participantsData, setParticipantsData] = useState({});
  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Listen to all chats where user is a participant
    const chatsRef = collection(FIRESTORE_DB, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc') // requires composite index
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatsData);

      // Fetch info for all other participants
      const otherIds = chatsData
        .map(chat => chat.participants.find(p => p !== userId))
        .filter(Boolean);

      const uniqueIds = [...new Set(otherIds)];
      const participantInfo = {};

      for (let id of uniqueIds) {
        const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', id));
        if (userDoc.exists()) {
          participantInfo[id] = userDoc.data();
        } else {
          participantInfo[id] = { displayName: 'Provider', avatar: null };
        }
      }
      setParticipantsData(participantInfo);

    }, (error) => {
      console.error("Error fetching chats:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  const renderChatItem = ({ item }) => {
    const otherId = item.participants.find(p => p !== userId);
    const participant = participantsData[otherId] || { displayName: 'Provider', avatar: null };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, providerId: otherId })}
      >
        <View style={styles.messageCard}>
          <Image
            source={{ uri: participant.avatar || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.name}>{participant.displayName}</Text>
            <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No chats yet</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: '#888',
    marginTop: 5,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 16,
  }
});

export default MessageScreen;

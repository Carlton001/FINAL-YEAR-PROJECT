import React, { useEffect, useState, useRef } from 'react';
import { 
  View, TextInput, KeyboardAvoidingView, 
  Platform, StyleSheet, Text, TouchableOpacity, FlatList 
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, updateDoc, doc, getDocs, where 
} from 'firebase/firestore';

const ChatRoom = ({ navigation, route }) => {
  const { chatId: initialChatId, provider } = route.params || {};
  const [chatId, setChatId] = useState(initialChatId || null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  // Track logged in user & setup chat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      setUser(authUser);

      // If no chatId but provider is given → check/create chat
      if (!chatId && provider) {
        const chatsRef = collection(FIRESTORE_DB, "chats");
        const q = query(chatsRef, where("participants", "array-contains", authUser.uid));
        const snapshot = await getDocs(q);

        let existingChat = null;
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.participants.includes(provider.id)) {
            existingChat = { id: docSnap.id, ...data };
          }
        });

        if (existingChat) {
          setChatId(existingChat.id);
        } else {
          // Create new chat doc
          const newChatRef = await addDoc(chatsRef, {
            participants: [authUser.uid, provider.id],
            lastMessage: "",
            updatedAt: serverTimestamp(),
          });
          setChatId(newChatRef.id);
        }
      }
    });

    return unsubscribe;
  }, [provider, chatId]);

  // Load messages in real time
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(FIRESTORE_DB, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [chatId]);

  // Send message
  const handleSend = async () => {
    try {
      if (!message.trim()) {
        console.log("⚠️ Message is empty, not sending.");
        return;
      }
      if (!user) {
        console.log("⚠️ No logged-in user.");
        return;
      }
      if (!chatId) {
        console.log("⚠️ No chatId found, cannot send message.");
        return;
      }

      console.log("📤 Sending message:", message);

      // Add to messages subcollection
      const msgRef = await addDoc(
        collection(FIRESTORE_DB, "chats", chatId, "messages"),
        {
          senderId: user.uid,
          text: message,
          createdAt: serverTimestamp(),
        }
      );

      console.log("✅ Message sent with ID:", msgRef.id);

      // Update parent chat doc
      await updateDoc(doc(FIRESTORE_DB, "chats", chatId), {
        lastMessage: message,
        updatedAt: serverTimestamp(),
      });

      console.log("📌 Chat updated with lastMessage.");

      setMessage('');
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  // Render each message bubble
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.otherMsg]}>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, marginLeft: 5 },
  
  msgBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  myMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  otherMsg: { backgroundColor: '#EEE', alignSelf: 'flex-start' },

  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
  },
});

export default ChatRoom;

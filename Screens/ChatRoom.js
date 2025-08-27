import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ChatRoom = ({ navigation, route }) => {
  const { provider, chatId: routeChatId, participants: routeParticipants } = route.params || {};
  const [chatId, setChatId] = useState(routeChatId || null);
  const [participants, setParticipants] = useState(routeParticipants || []);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);

  // 1) Handle auth + ensure chat doc if creating a new one
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      setUser(authUser);

      // Case A: chat already provided (from Messages list)
      if (routeChatId) {
        setChatId(routeChatId);
        setParticipants(routeParticipants || []);
        setError(null);
        return;
      }

      // Case B: opening from Provider profile (need provider.postedById)
      const otherUid = provider?.postedById;
      if (!otherUid) {
        setError('Invalid provider data (missing postedById).');
        return;
      }

      try {
        const derivedChatId = [authUser.uid, otherUid].sort().join('_');
        const chatRef = doc(FIRESTORE_DB, 'chats', derivedChatId);

        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: [authUser.uid, otherUid],
            lastMessage: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          // Load participants from existing doc
          setParticipants(chatSnap.data()?.participants || [authUser.uid, otherUid]);
        }

        setChatId(derivedChatId);
        setError(null);
      } catch (e) {
        console.error('Error ensuring chat doc:', e);
        setError('Could not create or access chat.');
      }
    });

    return unsubscribe;
  }, [provider, routeChatId]);

  // 2) Subscribe to messages once chatId is known
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(FIRESTORE_DB, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
      },
      (err) => {
        console.error('❌ Snapshot error:', err);
        if (err.code === 'permission-denied') {
          setError("You don't have access to this chat.");
        } else {
          setError('Something went wrong while loading messages.');
        }
      }
    );

    return unsubscribe;
  }, [chatId]);

  // 3) Send message
  const handleSend = async () => {
    if (!message.trim() || !user || !chatId) return;

    try {
      await addDoc(collection(FIRESTORE_DB, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        text: message,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(FIRESTORE_DB, 'chats', chatId), {
        lastMessage: message,
        updatedAt: serverTimestamp(),
      });

      setMessage('');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      Alert.alert('Error', "You don't have permission to send a message in this chat.");
    }
  };

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

      {/* Chat messages */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      {!error && (
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
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, marginLeft: 5 },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  msgBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '75%' },
  myMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  otherMsg: { backgroundColor: '#EEE', alignSelf: 'flex-start' },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10 },
  sendButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 50 },
});

export default ChatRoom;

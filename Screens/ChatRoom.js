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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const ChatRoom = ({ navigation, route }) => {
  const { provider, chatId: routeChatId } = route.params || {};
  const [chatId, setChatId] = useState(routeChatId || null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [otherPaymentMethod, setOtherPaymentMethod] = useState(null);
  const flatListRef = useRef(null);

  // --- Zoom / Pan / Double Tap
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      let newScale = savedScale.value * event.scale;
      newScale = Math.max(1, Math.min(newScale, 3));
      scale.value = newScale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1, { duration: 200 });
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        scale.value = withTiming(2);
      }
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));

  // --- Auth & Chat setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      setUser(authUser);

      if (routeChatId) {
        setChatId(routeChatId);
        setError(null);
        return;
      }

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

  // --- Fetch other user's payment method
  useEffect(() => {
    if (!user || !chatId) return;

    const fetchPaymentMethod = async () => {
      try {
        const chatRef = doc(FIRESTORE_DB, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) return;

        const participants = chatSnap.data()?.participants || [];
        const otherUid = participants.find((uid) => uid !== user.uid);
        if (!otherUid) return;

        const otherRef = doc(FIRESTORE_DB, 'users', otherUid);
        const otherSnap = await getDoc(otherRef);
        if (!otherSnap.exists()) return;

        const otherData = otherSnap.data();
        if (otherData.paymentMethod) {
          setOtherPaymentMethod(otherData.paymentMethod);
        } else if (otherData.paymentDetails) {
          setOtherPaymentMethod(otherData.paymentDetails);
        } else {
          setOtherPaymentMethod(null);
        }
      } catch (err) {
        console.error('Error fetching payment method:', err);
      }
    };

    fetchPaymentMethod();
  }, [chatId, user]);

  const handleShowPayment = () => {
    if (!otherPaymentMethod) {
      Alert.alert('No Payment Method', 'This user has not set up a payment method.');
      return;
    }

    if (typeof otherPaymentMethod === 'object') {
      Alert.alert(
        'Payment Method',
        `Network: ${otherPaymentMethod.network ?? "N/A"}\nName: ${otherPaymentMethod.name ?? "N/A"}\nNumber: ${otherPaymentMethod.number ?? "N/A"}`
      );
    } else {
      Alert.alert('Payment Method', String(otherPaymentMethod));
    }
  };

  // --- Subscribe to messages
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(FIRESTORE_DB, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError(null);
    }, (err) => {
      console.error('Snapshot error:', err);
      setError('Something went wrong while loading messages.');
    });

    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!message.trim() || !user || !chatId) return;

    try {
      await addDoc(collection(FIRESTORE_DB, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        text: message,
        createdAt: serverTimestamp(),
      });

      const chatRef = doc(FIRESTORE_DB, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: message,
        updatedAt: serverTimestamp(),
      });

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
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
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.innerContainer, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShowPayment} style={styles.paymentButton}>
              <Ionicons name="card-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
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
              style={{ flex: 1 }}
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
        </Animated.View>
      </GestureDetector>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 40,
    justifyContent: 'space-between',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, marginLeft: 5 },
  paymentButton: { padding: 8 },
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
  sendButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 50 },
});

export default ChatRoom;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  FIRESTORE_DB,
  FIREBASE_AUTH
} from "../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MessageScreen = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch chats where the user is a participant
  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(FIRESTORE_DB, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allChats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(allChats);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching chats:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // ✅ Open or create chat
  const openChat = async (item) => {
    if (!userId) return;

    const otherId = item.participants.find((uid) => uid !== userId);
    if (!otherId) return;

    const chatId = [userId, otherId].sort().join("_");
    const chatRef = doc(FIRESTORE_DB, "chats", chatId);

    try {
      const snap = await getDoc(chatRef);

      if (!snap.exists()) {
        const chatData = {
          participants: [userId, otherId],
          lastMessage: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          meta: {
            [userId]: { displayName: "You" },
            [otherId]: {
              displayName: item.meta?.[otherId]?.displayName || "User",
              avatar: item.meta?.[otherId]?.avatar || null,
            },
          },
        };
        await setDoc(chatRef, chatData);
        console.log("✅ Created missing chat:", chatId);
      }

      // ✅ Navigate to ChatRoom with postedById included
      navigation.navigate("ChatRoom", {
        chatId,
        participant: {
          uid: otherId,
          displayName: item.meta?.[otherId]?.displayName || "User",
          avatar:
            item.meta?.[otherId]?.avatar || "https://via.placeholder.com/50",
        },
        postedById: userId, // 🔑 FIX: Always send this
      });
    } catch (err) {
      console.error("❌ Error opening chat:", err);
    }
  };

  const renderChatItem = ({ item }) => {
    if (!item.participants) return null;

    const otherId = item.participants.find((uid) => uid !== userId);
    const other = item.meta?.[otherId] || { displayName: "User", avatar: null };

    return (
      <TouchableOpacity onPress={() => openChat(item)}>
        <View style={styles.messageCard}>
          <Image
            source={{
              uri: other.avatar || "https://via.placeholder.com/50",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.name}>{other.displayName}</Text>
            <Text style={styles.lastMessage}>
              {item.lastMessage || "No messages yet"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading chats...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No chats yet</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop: 70 },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ddd" },
  name: { fontWeight: "bold", fontSize: 16 },
  lastMessage: { color: "#888", marginTop: 5, fontSize: 14 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 16 },
});

export default MessageScreen;

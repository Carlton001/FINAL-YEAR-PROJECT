import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  deleteDoc,
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

  // ✅ Delete chat with confirmation
  const deleteChat = (chatId) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(FIRESTORE_DB, "chats", chatId));
              console.log("Chat deleted:", chatId);
            } catch (err) {
              console.error("❌ Error deleting chat:", err);
            }
          },
        },
      ]
    );
  };

  // ✅ Fetch user profile
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(FIRESTORE_DB, "users", uid);
      const userSnap = await getDoc(userRef);
      let userData = {};
      if (userSnap.exists()) {
        userData = userSnap.data();
      }

      const providersRef = collection(FIRESTORE_DB, "providers");
      const q = query(providersRef, where("postedById", "==", uid));
      const providerSnap = await getDocs(q);

      if (!providerSnap.empty) {
        const providerData = providerSnap.docs[0].data();
        userData.servicename = providerData.servicename;
      }

      return userData;
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
    return {};
  };

  // ✅ Open or create chat
  const openChat = async (item) => {
    if (!userId) return;

    const otherId = item.participants.find((uid) => uid !== userId);
    if (!otherId) return;

    const chatId = [userId, otherId].sort().join("_");
    const chatRef = doc(FIRESTORE_DB, "chats", chatId);

    try {
      const snap = await getDoc(chatRef);
      const otherProfile = await fetchUserProfile(otherId);

      let displayName = "User";
      if (otherProfile.firstName && otherProfile.lastName) {
        displayName = `${otherProfile.firstName} ${otherProfile.lastName}`;
        if (otherProfile.servicename) {
          displayName += ` (${otherProfile.servicename})`;
        }
      } else if (otherProfile.servicename) {
        displayName = otherProfile.servicename;
      }

      if (!snap.exists()) {
        const chatData = {
          participants: [userId, otherId],
          lastMessage: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          meta: {
            [userId]: { displayName: "You", unreadCount: 0 },
            [otherId]: {
              displayName,
              avatar: otherProfile.profileImage || null,
              unreadCount: 0,
            },
          },
        };
        await setDoc(chatRef, chatData);
      } else {
        const existing = snap.data();
        const updatedMeta = {
          ...existing.meta,
          [otherId]: {
            displayName,
            avatar: otherProfile.profileImage || null,
            unreadCount: existing.meta?.[otherId]?.unreadCount || 0,
          },
        };
        await setDoc(chatRef, { ...existing, meta: updatedMeta });
      }

      await updateDoc(chatRef, {
        [`meta.${userId}.unreadCount`]: 0,
      });

      navigation.navigate("ChatRoom", {
        chatId,
        participant: {
          uid: otherId,
          displayName,
          avatar:
            otherProfile.profileImage || "https://via.placeholder.com/50",
        },
        postedById: userId,
      });
    } catch (err) {
      console.error("❌ Error opening chat:", err);
    }
  };

  // ✅ Render chat items
  const renderChatItem = ({ item }) => {
    if (!item.participants) return null;

    const otherId = item.participants.find((uid) => uid !== userId);
    const other = item.meta?.[otherId] || {
      displayName: "User",
      avatar: null,
    };
    const unread = item.meta?.[userId]?.unreadCount || 0;

    return (
      <TouchableOpacity
        onPress={() => openChat(item)}
        onLongPress={() => deleteChat(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.chatCard}>
          <Image
            source={{
              uri: other.avatar || "https://via.placeholder.com/50",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{other.displayName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || "No messages yet"}
            </Text>
          </View>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1199dd" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No chats yet</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 15,
    backgroundColor: "#1199dd",
    color: "white",
    elevation: 3,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontWeight: "600", fontSize: 16, color: "#222" },
  lastMessage: { color: "#777", marginTop: 4, fontSize: 14 },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1199dd",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MessageScreen;

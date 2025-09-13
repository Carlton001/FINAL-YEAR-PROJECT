import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView, // 👈 Import SafeAreaView
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

  // ✅ Fetch profile (unchanged)
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

  // ✅ Open or create chat (unchanged)
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

      // ✅ Reset unread count for current user
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

  // ✅ Render chat items (unchanged)
  const renderChatItem = ({ item }) => {
    if (!item.participants) return null;

    const otherId = item.participants.find((uid) => uid !== userId);
    const other = item.meta?.[otherId] || {
      displayName: "User",
      avatar: null,
    };
    const unread = item.meta?.[userId]?.unreadCount || 0;

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
          {unread > 0 && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Chats</Text>
        <Text style={styles.emptyText}>Loading chats...</Text>
      </SafeAreaView>
    );

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
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // 👈 Removed marginTop
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#1199ddff", // 👈 Example header color (green)
    color: "white",
  },
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
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    marginLeft: 10,
  },
});

export default MessageScreen;

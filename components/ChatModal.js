import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../Firebase";

const ChatModal = ({ visible, onClose, navigation, provider }) => {
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    setLoading(true);

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      if (!provider?.postedById) {
        console.error("Provider is missing postedById");
        setLoading(false);
        return;
      }

      // ✅ generate unique chatId
      const chatId =
        user.uid < provider.postedById
          ? `${user.uid}_${provider.postedById}`
          : `${provider.postedById}_${user.uid}`;

      const chatRef = doc(FIRESTORE_DB, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, provider.postedById],
          lastMessage: "",
          updatedAt: serverTimestamp(),
        });
      }

      navigation.navigate("ChatRoom", { chatId, provider });
      onClose();
    } catch (error) {
      console.error("❌ Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Start a Chat</Text>
          <Text style={styles.subtitle}>
            Chat with{" "}
            <Text style={{ fontWeight: "600" }}>
              {provider?.servicename || "Provider"}
            </Text>
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#1199dd" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.chatButton]}
                onPress={handleChat}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    width: 320,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  chatButton: {
    backgroundColor: "#1199dd",
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: "#eee",
  },
  closeButtonText: {
    color: "#444",
    fontWeight: "500",
    fontSize: 15,
  },
});

export default ChatModal;

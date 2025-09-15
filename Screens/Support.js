import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // icons
import * as MailComposer from "expo-mail-composer";

const Width = Dimensions.get("window").width;

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");

  const sendEmail = async () => {
    if (!name || !email || !problem) {
      Alert.alert(
        "Missing Info",
        "Please fill in at least your name, email, and problem description."
      );
      return;
    }

    const bodyMessage = `
Name: ${name}
Email: ${email}
Phone: ${phone}
Problem:
${problem}
    `;

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ["nganane@st.ug.edu.gh"],
          subject: "Tech Support Request",
          body: bodyMessage,
        });
        Alert.alert("✅ Success", "Your message has been sent.");
        setName("");
        setEmail("");
        setPhone("");
        setProblem("");
      } else {
        Alert.alert("Error", "Mail service is not available on this device.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.alert("Error", "Failed to send email.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={60} color="#007acc" />
          <Text style={styles.title}>Customer Support</Text>
          <Text style={styles.subtitle}>
            Tell us what’s going on, and we’ll get back to you.
          </Text>
        </View>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue..."
          placeholderTextColor="#666"
          value={problem}
          onChangeText={setProblem}
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity style={styles.button} onPress={sendEmail}>
          <Ionicons name="send" size={20} color="white" />
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7faff" },
  scrollContainer: {
    paddingVertical: 30,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#007acc", marginTop: 10 },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  input: {
    width: Width * 0.9,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    fontSize: 15,
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 25,
    backgroundColor: "#007acc",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    width: Width * 0.9,
    borderRadius: 30,
    shadowColor: "#007acc",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Support;
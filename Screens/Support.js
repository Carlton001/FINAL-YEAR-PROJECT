import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import * as MailComposer from "expo-mail-composer";

const Width = Dimensions.get("window").width;
const Height = Dimensions.get("window").height;

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");

  const sendEmail = async () => {
    if (!name || !email || !problem) {
      Alert.alert("Missing Info", "Please fill in at least your name, email, and problem description.");
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
          recipients: ["nganane@st.ug.edu.gh"], // admin email
          subject: "Tech Support Request",
          body: bodyMessage,
        });
        Alert.alert("Success", "Your message has been sent.");
      } else {
        Alert.alert("Error", "Mail service is not available on this device.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.alert("Error", "Failed to send email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Support</Text>

      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Problem description"
        value={problem}
        onChangeText={setProblem}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={sendEmail}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5faff", padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 20, color: "#007acc" },
  input: {
    width: Width * 0.9,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    placeholderTextColor:"#888",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007acc",
    paddingVertical: 12,
    width: Width * 0.5,
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default Support;

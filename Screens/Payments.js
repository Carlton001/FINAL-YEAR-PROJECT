// Screens/Payments.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const db = getFirestore();

const PaymentOptions = ["MTN", "Telecel", "AirtelTigo"];

const Payments = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [selectedOption, setSelectedOption] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [momoNumber, setMomoNumber] = useState("");

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!currentUser?.uid) return;
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.paymentMethod) {
            setSelectedOption(data.paymentMethod.network);
            setAccountName(data.paymentMethod.accountName || "");
            setMomoNumber(data.paymentMethod.number || "");
          }
        }
      } catch (error) {
        console.error("Error fetching payment info:", error);
      }
    };
    fetchPaymentInfo();
  }, [currentUser]);

  const handleSave = async () => {
    if (!selectedOption || !accountName.trim() || !momoNumber.trim()) {
      Alert.alert("Error", "Please fill in all fields before saving.");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        paymentMethod: {
          network: selectedOption,
          accountName: accountName.trim(),
          number: momoNumber.trim(),
        },
      });
      Alert.alert("Success", "Payment method saved!");
    } catch (error) {
      console.error("Error saving payment info:", error);
      Alert.alert("Error", "Could not save payment info.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Mobile Money Provider</Text>

      {/* Payment Options */}
      {PaymentOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionContainer}
          onPress={() => setSelectedOption(option)}
        >
          <View
            style={[
              styles.radioCircle,
              selectedOption === option && styles.selectedCircle,
            ]}
          />
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      {/* Account Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter account name"
        value={accountName}
        onChangeText={setAccountName}
      />

      {/* Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your MoMo number"
        keyboardType="numeric"
        value={momoNumber}
        onChangeText={setMomoNumber}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
  },
  selectedCircle: {
    backgroundColor: "#007AFF",
  },
  optionText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default Payments;

import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FIRESTORE_DB } from '../Firebase'; // Assuming Firebase is set up
import { collection, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';



const { width: Width, height: Height } = Dimensions.get('window');

const PostService = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [type, setType] = useState('');
  const [about, setAbout] = useState('');

  const handlePostService = async () => {
    // Ensure all fields are filled
    if (!category || !name || !location || !mobileNumber || !type || !about) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Add data to Firestore (Firebase)
    try {
      const serviceRef = collection(FIRESTORE_DB, 'providers'); // Ensure collection is correctly referenced
      await addDoc(serviceRef, {
        name,
        service: category,
        location,
        distance: '', // Leave this to be calculated or added later
        mobileNumber,
        type,
        about,
      });

      // Success feedback
      Alert.alert('Success', 'Service posted successfully');
      
      // Navigate back to Home Screen
      navigation.navigate('Home');
    } catch (error) {
      console.error("Error posting service: ", error);
      Alert.alert('Error', 'Failed to post service. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Ionicons name="arrow-back" size={30} color="green" style={{ marginTop: 30 }} onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Post Service</Text>
      
      {/* Service Category */}
      <Text style={styles.label}>Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Hairdresser"
        placeholderTextColor="gray" // Gray placeholder text
        value={category}
        onChangeText={setCategory}
      />

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="John Doe"
        placeholderTextColor="gray" // Gray placeholder text
        value={name}
        onChangeText={setName}
      />

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="North Legon"
        placeholderTextColor="gray" // Gray placeholder text
        value={location}
        onChangeText={setLocation}
      />

      {/* Mobile Number */}
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={styles.input}
        placeholder="1234567890"
        placeholderTextColor="gray" // Gray placeholder text
        keyboardType="number-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />

      {/* Type Dropdown */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerContainer}>
      <Picker
      selectedValue={type}
      style={styles.picker}
      onValueChange={(itemValue) => setType(itemValue)}
      dropdownIconColor="gray"
      >
    <Picker.Item label="Select Type" value="" color="gray" />
    <Picker.Item label="Full Time" value="Full Time" color="gray" />
    <Picker.Item label="Part Time" value="Part Time" color="gray" />
  </Picker>
</View>


      {/* About Yourself */}
      <Text style={styles.label}>About Yourself</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your service..."
        placeholderTextColor="gray" // Gray placeholder text
        value={about}
        onChangeText={setAbout}
        multiline
      />

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePostService}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Width * 0.1,
    paddingTop: Height * 0.03,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    color: 'black', // Actual text color is black when typing
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    height: 150
  },
  postButton: {
    backgroundColor: '#005EB8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default PostService;

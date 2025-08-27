import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { FIRESTORE_DB, FIREBASE_STORAGE } from '../Firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';

const { width: Width, height: Height } = Dimensions.get('window');

const PostService = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [servicename, setServiceName] = useState('');
  const [location, setLocation] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [type, setType] = useState('');
  const [about, setAbout] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hasService, setHasService] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // ✅ Check if user already has a service using UID (not email)
  useEffect(() => {
    const checkUserService = async () => {
      if (!currentUser) return;
      try {
        const providersRef = collection(FIRESTORE_DB, 'providers');
        const q = query(providersRef, where('postedById', '==', currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) setHasService(true);
      } catch (err) {
        console.error("Error checking user service:", err);
      }
    };
    checkUserService();
  }, [currentUser]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePostService = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post a service.');
      return;
    }

    if (hasService) {
      Alert.alert('Error', 'You have already posted a service. Only one service per user is allowed.');
      return;
    }

    if (!category || !servicename || !location || !mobileNumber || !type || !about || !image) {
      Alert.alert('Error', 'Please fill in all fields and select an image');
      return;
    }

    setUploading(true);
    try {
      // ✅ Upload image
      const response = await fetch(image);
      const blob = await response.blob();
      const imagePath = `service_images/${Date.now()}.jpg`;
      const imageRef = ref(FIREBASE_STORAGE, imagePath);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      // ✅ Save with UID for chat linking
      await addDoc(collection(FIRESTORE_DB, 'providers'), {
        servicename,
        service: category,
        location,
        distance: '',
        mobileNumber,
        type,
        about,
        image: downloadURL,
        imagePath,
        postedById: currentUser.uid,   // 🔑 provider’s UID
        postedByEmail: currentUser.email,
        postedAt: new Date(),
      });

      Alert.alert('Success', 'Service posted successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error posting service: ', error);
      Alert.alert('Error', 'Failed to post service. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (hasService) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>You have already posted a service.</Text>
        <TouchableOpacity style={styles.postButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.postButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Ionicons name="arrow-back" size={30} color="green" style={{ marginTop: 30 }} onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Post Service</Text>

      <Text style={styles.label}>Service</Text>
      <TextInput style={styles.input} placeholder="Hairdresser" value={category} onChangeText={setCategory} placeholderTextColor="gray" />

      <Text style={styles.label}>Service Name</Text>
      <TextInput style={styles.input} placeholder="Sandra's Salon" value={servicename} onChangeText={setServiceName} placeholderTextColor="gray" />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} placeholder="North Legon" value={location} onChangeText={setLocation} placeholderTextColor="gray" />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput style={styles.input} placeholder="1234567890" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="number-pad" placeholderTextColor="gray" />

      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={type} onValueChange={setType} dropdownIconColor="gray" style={styles.picker}>
          <Picker.Item label="Select Type" value="" color="gray" />
          <Picker.Item label="Full Time" value="Full Time" color="gray" />
          <Picker.Item label="Part Time" value="Part Time" color="gray" />
        </Picker>
      </View>

      <Text style={styles.label}>About Yourself</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your service..." value={about} onChangeText={setAbout} multiline placeholderTextColor="gray" />

      <Text style={styles.label}>Profile Photo</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ color: '#005EB8', fontWeight: 'bold' }}>{image ? 'Change Image' : 'Pick an Image'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.postButton} onPress={handlePostService} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.postButtonText}>Post</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: Width * 0.1, paddingTop: Height * 0.03, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 20 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, color: 'black' },
  textArea: { height: 100 },
  pickerContainer: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginTop: 8, height: 150, justifyContent: 'center' },
  picker: { width: '100%', height: '100%' },
  imagePicker: { marginTop: 10, backgroundColor: '#e0f0ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  previewImage: { width: 100, height: 100, borderRadius: 10, marginTop: 10, alignSelf: 'center' },
  postButton: { backgroundColor: '#005EB8', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  postButtonText: { color: '#fff', fontSize: 18 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30, fontSize: 16 },
});

export default PostService;

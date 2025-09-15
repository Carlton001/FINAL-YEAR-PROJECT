import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { FIRESTORE_DB, FIREBASE_STORAGE } from '../Firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next'; // ✅ translation hook

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

  const { t } = useTranslation(); // ✅ translations
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // ✅ Check if user already has a service
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
      Alert.alert(t('permission_denied'), t('permission_message'));
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
      Alert.alert(t('error'), t('must_login'));
      return;
    }

    if (hasService) {
      Alert.alert(t('error'), t('already_posted'));
      return;
    }

    if (!category || !servicename || !location || !mobileNumber || !type || !about || !image) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const imagePath = `service_images/${Date.now()}.jpg`;
      const imageRef = ref(FIREBASE_STORAGE, imagePath);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

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
        postedById: currentUser.uid,
        postedByEmail: currentUser.email,
        postedAt: new Date(),
      });

      Alert.alert(t('success'), t('service_posted'));
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error posting service: ', error);
      Alert.alert(t('error'), t('post_failed'));
    } finally {
      setUploading(false);
    }
  };

  if (hasService) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t('already_posted')}</Text>
        <TouchableOpacity style={styles.postButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.postButtonText}>{t('go_home')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Ionicons name="arrow-back" size={30} color="green" style={{ marginTop: 30 }} onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{t('post_service')}</Text>

      <Text style={styles.label}>{t('service')}</Text>
      <TextInput style={styles.input} placeholder={t('service_placeholder')} value={category} onChangeText={setCategory} placeholderTextColor="gray" />

      <Text style={styles.label}>{t('service_name')}</Text>
      <TextInput style={styles.input} placeholder={t('service_name_placeholder')} value={servicename} onChangeText={setServiceName} placeholderTextColor="gray" />

      <Text style={styles.label}>{t('location')}</Text>
      <TextInput style={styles.input} placeholder={t('location_placeholder')} value={location} onChangeText={setLocation} placeholderTextColor="gray" />

      <Text style={styles.label}>{t('mobile_number')}</Text>
      <TextInput style={styles.input} placeholder={t('mobile_placeholder')} value={mobileNumber} onChangeText={setMobileNumber} keyboardType="number-pad" placeholderTextColor="gray" />

      <Text style={styles.label}>{t('type')}</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={type} onValueChange={setType} dropdownIconColor="gray" style={styles.picker}>
          <Picker.Item label={t('select_type')} value="" color="gray" />
          <Picker.Item label={t('full_time')} value="Full Time" color="gray" />
          <Picker.Item label={t('part_time')} value="Part Time" color="gray" />
        </Picker>
      </View>

      <Text style={styles.label}>{t('about')}</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder={t('about_placeholder')} value={about} onChangeText={setAbout} multiline placeholderTextColor="gray" />

      <Text style={styles.label}>{t('profile_photo')}</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ color: '#005EB8', fontWeight: 'bold' }}>{image ? t('change_image') : t('pick_image')}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.postButton} onPress={handlePostService} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.postButtonText}>{t('post')}</Text>}
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

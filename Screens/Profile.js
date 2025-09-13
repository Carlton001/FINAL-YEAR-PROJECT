import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth'; 
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
const db = getFirestore();
const storage = getStorage();

const Profile = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [fullName, setFullName] = useState(currentUser?.displayName || "Your Name");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(`${userData.firstName} ${userData.lastName}`);
            if (userData.profileImage) {
              setProfileImage(userData.profileImage); // load saved profile image
            }
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && currentUser?.uid) {
      const localUri = result.assets[0].uri;
      setProfileImage(localUri); // show immediately

      try {
        // upload to Firebase Storage
        const response = await fetch(localUri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profileImages/${currentUser.uid}.jpg`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        // save URL in Firestore
        await updateDoc(doc(db, "users", currentUser.uid), {
          profileImage: downloadURL,
        });

        setProfileImage(downloadURL); // replace local with cloud URL
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons 
            name="arrow-back" 
            size={30} 
            color="white" 
            style={{ marginTop: 25 }} 
          />
        </TouchableOpacity>
      </View>

      {/* Profile picture and name */}
      <View style={styles.profileContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={60} color="#999" />
          </View>
        )}
        <Text style={styles.name}>{fullName}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity  
          style={styles.button}
          onPress={() => {
            if (currentUser?.email) {
              navigation.navigate('UserServices', { userEmail: currentUser.email });
            }
          }}
        >
          <Text style={styles.buttonText}>Posted Services</Text>
        </TouchableOpacity>

        {/* ✅ New Buttons */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Payments')}
        >
          <Text style={styles.buttonText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4d4d' }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: 'white' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#24a0e8ff',
    height: Height * 0.15,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  profileContainer: { alignItems: 'center', marginTop: -Height * 0.075 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'white',
  },
  name: { marginTop: 15, fontSize: 24, fontWeight: 'bold', color: '#333' },
  buttonsContainer: { alignItems: 'center' },
  button: {
    backgroundColor: 'white',
    width: Width * 0.8,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: { fontSize: 18, color: '#333' },
});

export default Profile;

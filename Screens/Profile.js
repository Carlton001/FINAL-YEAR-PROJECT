import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth'; 
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslation } from 'react-i18next';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
const db = getFirestore();
const storage = getStorage();

const Profile = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(currentUser?.displayName || t("your_name"));
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
              setProfileImage(userData.profileImage);
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
      alert(t("media_permission_required"));
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
      setProfileImage(localUri);

      try {
        const response = await fetch(localUri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profileImages/${currentUser.uid}.jpg`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "users", currentUser.uid), {
          profileImage: downloadURL,
        });

        setProfileImage(downloadURL);
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile")}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={70} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{fullName}</Text>
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.editText}>{t("edit_profile")}</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UserServices', { userEmail: currentUser?.email })}
        >
          <Ionicons name="briefcase-outline" size={20} color="#24a0e8" />
          <Text style={styles.buttonText}>{t("posted_services")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Payments')}>
          <Ionicons name="card-outline" size={20} color="#24a0e8" />
          <Text style={styles.buttonText}>{t("payments")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="help-circle-outline" size={20} color="#24a0e8" />
          <Text style={styles.buttonText}>{t("contact_support")}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  header: {
    backgroundColor: '#24a0e8',
    height: Height * 0.12,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "white" },

  profileCard: {
    backgroundColor: "white",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: -40,
    paddingVertical: 25,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: "#24a0e8" },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { marginTop: 12, fontSize: 22, fontWeight: "700", color: "#333" },
  editText: { color: "#24a0e8", fontSize: 15, marginTop: 4 },

  buttonsContainer: { marginTop: 25, paddingHorizontal: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  buttonText: { fontSize: 16, marginLeft: 10, color: "#333" },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff4d4d",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: { fontSize: 16, marginLeft: 8, color: "white", fontWeight: "600" },
});

export default Profile;

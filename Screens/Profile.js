import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth'; // ✅ Import signOut

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const Profile = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Sign out the user
      navigation.replace('Login'); // ✅ Navigate to Login screen
    } catch (error) {
      console.error("Error logging out: ", error);
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
        <View style={styles.profileImage} />
        <Text style={styles.name}>{currentUser?.displayName || "Your Name"}</Text>
        <Text style={styles.role}>Barber</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
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

        {/* Logout Button */}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4d4d' }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: 'white' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#24a0e8ff',
    height: Height * 0.15,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -Height * 0.075,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
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
  buttonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Profile;

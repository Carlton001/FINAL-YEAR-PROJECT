import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';

// Get screen width and height for responsive design
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const Profile = () => {

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={30} color="white" style={{ marginTop: 25}} onPress={() => navigation.goBack()}/>
        </TouchableOpacity>
      </View>

      {/* Profile picture and name */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImage} />
        <Text style={styles.name}>Josiah Gyan</Text>
        <Text style={styles.role}>Barber</Text>
      </View>

      {/* Edit Profile and Posted Services Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Posted Services</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#179139',
    height: Height * 0.15,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -Height * 0.075, // To overlap with the green header background
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0', // Placeholder gray
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
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
  },
})

export default Profile

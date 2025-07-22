import { View, Text, TextInput, Dimensions, Platform, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert} from 'react-native'
import React, { useState } from 'react'
import CheckBox from 'react-native-check-box'
import { FIREBASE_AUTH, FirebaseAuth } from '../Firebase';
import { createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const db = getFirestore();

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const SignUp = () => {
  const navigation = useNavigation();
  const [isChecked, setIsChecked] = useState(false);
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [number, setnumber] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    // Check if any of the fields are empty
    if (!name || !number || !password || !email) {
        alert('Please fill in all fields');
        return;
    }

    if(isChecked == false){
      Alert.alert('Please tick to accept Terms and Policies');
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      // After successful sign up, you can update the user's display name


        // Add user details to Firestore
        const docRef = await addUserToFirestore(auth.currentUser.uid, name, email, number);

        // Wait for 3 seconds before navigating
        // setTimeout(() => {
            navigation.navigate('TabScreen');
        // }, 3000);
    } catch (error) {
        if (error.code === 'auth/weak-password') {
            Alert.alert('The password provided is too weak.');
        } else if (error.code === 'auth/number-already-in-use') {
            Alert.alert('The account already exists for that number.');
        } else if (error.code === 'auth/invalid-number') {
            Alert.alert('The number address is invalid.');
        } else {
            console.error(error);
        }
    }
}




// Function to add user details to Firestore
const addUserToFirestore = async (uid, name, number) => {
    try {
        const docRef = await addDoc(collection(db, 'users'), {
            uid,
            name,
            number
        });
        console.log('User added to Firestore successfully!');
        return docRef; // Return docRef for further use
    } catch (error) {
        console.error('Error adding user to Firestore: ', error);
        throw error;
    }
}

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.Top}>Complete your free account setup</Text>
      <View style={styles.form}>
        <TextInput placeholder='First Name' placeholderTextColor="#a3a19b" value={name} onChangeText={text => setName(text)} style={styles.input}/>
        <TextInput placeholder='Email' placeholderTextColor="#a3a19b" value={email} onChangeText={text => setEmail(text)} style={styles.input}/>
        <TextInput placeholder='Phone Number' placeholderTextColor="#a3a19b" value={number} onChangeText={text => setnumber(text)} style={styles.input}/>
        <TextInput placeholder='Create a Password' secureTextEntry={true} placeholderTextColor="#a3a19b" value={password} onChangeText={text => setPassword(text)} style={styles.input}/>
        <View style={styles.policy}>
            <CheckBox 
              style={styles.checkbox} 
              isChecked={isChecked} 
              onClick={() => setIsChecked(!isChecked)}
            />
            <Text style={styles.policytext}>
              Yes, I understand and agree to the Terms Of Service, including the User Agreement and Privacy Policy
            </Text>
        </View>
        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
            <Text style={styles.buttonext}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
    input: {
        width: Width * 0.8,
        borderColor: '#005EB8',
        borderWidth: 1,
        padding: 13,
        marginTop: Height * 0.04,
        borderRadius: 5
    },
    form: {
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#005EB8',
        padding: 12,
        marginTop: Height * 0.03,
        borderRadius: 15
    },
    buttonext: {
        fontSize: 20,
        paddingHorizontal: 16,
        color: '#fff'
    },
    signup: {
        flexDirection: 'row',
        marginTop: 20
    },
    text1: {
        fontSize: 16
    },
    text2: {
        fontSize: 16,
        color: '#005EB8',
        paddingHorizontal: 5,
        fontWeight: '700'
    },
    Top: {
        fontSize: 45,
        width: Width * 0.8,
    },
    policy: {
        borderWidth: 1,
        height: Height * 0.12,
        width: Width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Height * 0.04,
        borderColor: 'gray',
        borderRadius: 5,
        flexDirection: 'row'
    },
    policytext: {
        fontSize: 16,
        width: Width * 0.68
    },
    checkbox: {
        marginTop: Height * -0.032,
        paddingHorizontal: 7
    }
})

export default SignUp

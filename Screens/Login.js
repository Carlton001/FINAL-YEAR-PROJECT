import { View, Text, TextInput, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Image} from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH, FirebaseAuth } from '../Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const Login = () => {
    const [password, setPassword] = useState(''); 
    const [email, setEmail] = useState(''); 

    const auth = FIREBASE_AUTH

    const navigation = useNavigation()

    const handleSignin = async () => {
        // Check if email or password is empty
        if (!email.trim() || !password.trim()) {
            alert('Please enter both email and password');
            return;
        }
    
        try {
            const response = await signInWithEmailAndPassword(
                auth,
                email, // Use state variable for email
                password // Use state variable for password
            );
            navigation.navigate('TabScreen'); // Navigate to the Home screen after successful sign-in
        } catch (e) {
            if (e.code === 'auth/invalid-credential') {
                alert('Wrong Credentials');
            }
            else {
                console.error(e);
            }
        }
    }
    
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
        <Image style={styles.logo} source={require('../assests/logo.png')}/>
      <View style={styles.form}>
        <TextInput placeholder='Enter your Email' textContentType='oneTimeCode' placeholderTextColor="#a3a19b" value={email} onChangeText={text => setEmail(text)} style={styles.input} />
        <TextInput placeholder='Enter your password' textContentType='oneTimeCode' secureTextEntry={true} placeholderTextColor="#a3a19b" value={password} onChangeText={text => setPassword(text)} style={styles.input}/>
        <TouchableOpacity onPress={handleSignin} style={styles.button}>
            <Text style={styles.buttonext}>Login</Text>
        </TouchableOpacity>
        <View style={styles.signup}>
            <Text style={styles.text1}>Don't have an account?</Text>
            <TouchableOpacity onPress={()=>{navigation.navigate('SignUp')}}><Text style={styles.text2}>SignUp</Text></TouchableOpacity>
        </View>
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
        padding: 15,
        marginTop: Height * 0.05,
        borderRadius: 5
    },
    form: {
        marginTop: Height * 0.1,
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#005EB8',
        padding: 12,
        marginTop: Height * 0.03,
        borderRadius: 15
    },
    buttonext: {
        fontSize: 18,
        paddingHorizontal: 12,
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
    logo: {
        width: Width * 0.9,
        height: Height * 0.3,
        marginBottom: Height * 0 ,
    }
})

export default Login
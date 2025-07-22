import { View, Text, TextInput, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useTranslation } from 'react-i18next' // ✅ Add this

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const Login = () => {
  const [password, setPassword] = useState(''); 
  const [email, setEmail] = useState(''); 

  const auth = FIREBASE_AUTH
  const navigation = useNavigation()
  const { t } = useTranslation() // ✅ Translation hook

  const handleSignin = async () => {
    if (!email.trim() || !password.trim()) {
      alert(t('empty_fields'))
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigation.navigate('TabScreen')
    } catch (e) {
      if (e.code === 'auth/invalid-credential') {
        alert(t('wrong_credentials'))
      } else {
        console.error(e)
      }
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
      <Image style={styles.logo} source={require('../assests/logo.png')} />
      <View style={styles.form}>
        <TextInput
          placeholder={t('enter_email')}
          textContentType="oneTimeCode"
          placeholderTextColor="#a3a19b"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder={t('enter_password')}
          textContentType="oneTimeCode"
          secureTextEntry={true}
          placeholderTextColor="#a3a19b"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSignin} style={styles.button}>
          <Text style={styles.buttonext}>{t('login')}</Text>
        </TouchableOpacity>
        <View style={styles.signup}>
          <Text style={styles.text1}>{t('no_account')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.text2}>{t('signup')}</Text>
          </TouchableOpacity>
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
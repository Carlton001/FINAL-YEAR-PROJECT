import { 
  View, 
  Text, 
  TextInput, 
  Dimensions, 
  Platform, 
  KeyboardAvoidingView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import React, { useState } from 'react';
import CheckBox from 'react-native-check-box';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../Firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // ✅ Added

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const SignUp = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // ✅ hook

  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(''); 
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    if (!firstName || !lastName || !number || !password || !email) {
      Alert.alert(t('missing_fields_title'), t('missing_fields_message'));
      return;
    }

    if (!isChecked) {
      Alert.alert(t('terms_required_title'), t('terms_required_message'));
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(doc(FIRESTORE_DB, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        number,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        t('signup_success_title'),
        t('signup_success_message'),
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Login'),
          }
        ]
      );
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        Alert.alert(t('weak_password_title'), t('weak_password_message'));
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert(t('account_exists_title'), t('account_exists_message'));
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(t('invalid_email_title'), t('invalid_email_message'));
      } else {
        console.error(error);
        Alert.alert(t('error_title'), t('error_message'));
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.Top}>{t('signup_title')}</Text>
      <View style={styles.form}>
        <TextInput placeholder={t('first_name')} placeholderTextColor="#a3a19b" value={firstName} onChangeText={setFirstName} style={styles.input}/>
        <TextInput placeholder={t('last_name')} placeholderTextColor="#a3a19b" value={lastName} onChangeText={setLastName} style={styles.input}/>
        <TextInput placeholder={t('email')} placeholderTextColor="#a3a19b" value={email} onChangeText={setEmail} style={styles.input}/>
        <TextInput placeholder={t('phone_number')} placeholderTextColor="#a3a19b" value={number} onChangeText={setNumber} style={styles.input}/>
        <TextInput placeholder={t('create_password')} secureTextEntry={true} placeholderTextColor="#a3a19b" value={password} onChangeText={setPassword} style={styles.input}/>
        
        <View style={styles.policy}>
          <CheckBox 
            style={styles.checkbox} 
            isChecked={isChecked} 
            onClick={() => setIsChecked(!isChecked)}
          />
          <Text style={styles.policytext}>
            {t('terms_text')}
          </Text>
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonext}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backText: {
    fontSize: 18,
    color: '#005EB8',
  },
  input: {
    width: Width * 0.8,
    borderColor: '#005EB8',
    borderWidth: 1,
    padding: 13,
    marginTop: Height * 0.025,
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
  Top: {
    fontSize: 28,
    width: Width * 0.8,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  policy: {
    borderWidth: 1,
    minHeight: Height * 0.12,
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
});

export default SignUp;

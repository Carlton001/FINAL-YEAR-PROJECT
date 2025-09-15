import '../src/locales/i18n'; // This initializes i18n
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next' // ✅ Added

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const Landing = () => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation() // ✅ Translation hook

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
  }

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assests/logo.png')} />
      <Text style={styles.Top}>{t('create_account')}</Text>
      <Image style={styles.logo1} source={require('../assests/img2.png')} />

      <View style={styles.form}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.button}>
          <Text style={styles.buttonext}>{t('continue')}</Text>
        </TouchableOpacity>

        <View style={styles.signup}>
          <Text style={styles.text1}>{t('already_have_account')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.text2}>{t('login')}</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Language Switch Buttons */}
        <View style={styles.langSwitcher}>
          <TouchableOpacity onPress={() => changeLanguage('en')}>
            <Text style={styles.langBtn}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeLanguage('tw')}>
            <Text style={styles.langBtn}>Twi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeLanguage('ga')}>
            <Text style={styles.langBtn}>Ga</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeLanguage('ew')}>
            <Text style={styles.langBtn}>Ewe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  Top: {
    fontSize: 32,
    width: Width * 0.8
  },
  logo: {
    width: Width * 0.5,
    height: Height * 0.20
  },
  logo1: {
    marginLeft: Width * -0.1,
    marginBottom: -60,
    marginTop: 50,
  },
  langSwitcher: {
    flexDirection: 'row',
    marginTop: 20,
    flexWrap: 'wrap', // ✅ allows wrapping if too many buttons
    justifyContent: 'center'
  },
  langBtn: {
    fontSize: 16,
    color: '#005EB8',
    fontWeight: '600',
    marginHorizontal: 10,
    marginVertical: 5
  }
})

export default Landing

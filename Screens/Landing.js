import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const Landing = () => {

    const navigation = useNavigation()

    return (
        <View style={styles.container}>
        <Image style={styles.logo} source={require('../assests/logo.png')}/>
          <Text style={styles.Top}>Create Your Free Account</Text>
        <Image style={styles.logo1} source={require('../assests/img.png')}/>
          <View style={styles.form}>
            <TouchableOpacity onPress={()=>{navigation.navigate('SignUp')}} style={styles.button}>
                <Text style={styles.buttonext}>Continue</Text>
            </TouchableOpacity>
            <View style={styles.signup}>
                <Text style={styles.text1}>Already have an account?</Text>
                <TouchableOpacity onPress={()=>{navigation.navigate('Login')}}><Text style={styles.text2}>Login</Text></TouchableOpacity>
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
            width: Width * 0.8,
            
        },
        logo: {
            width: Width * 0.5,
            height: Height * 0.20     
        },
        logo1: {
            marginLeft: Width * -0.1   
        }
    })
    

export default Landing
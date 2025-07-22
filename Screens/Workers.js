import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'
import Ionicons from "react-native-vector-icons/Ionicons";

const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

export default function Workers() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}><Ionicons name={'arrow-back'} size={30}/></Text>
      <View style={styles.imagecont}>
        <Image style={styles.image} source={require('../assests/profile.png')}/>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.job}>Hairdresser</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.top}>
          <View style={styles.bg}><Text><Ionicons name='location' color='#fff' size={17}/></Text><Text style={styles.text}>North Legon</Text></View>
          <Text style={styles.text}>1.7km</Text>
          <Text style={styles.text}>Full Time</Text>
        </View>
        <View style={styles.middle}>
            <Text style={styles.text1}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur...</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.button}>
            <Ionicons name='call' size={30} color='#fff'/>
            <Text style={styles.font}>Call</Text>
        </View>
        <View style={styles.button}>
            <Ionicons name='chatbubble' size={30} color='#fff'/>
            <Text style={styles.font}>Chat</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    icon:{
        marginTop: Height * 0.08,
        marginLeft: Width * 0.07
    },
    imagecont: {
        alignItems: 'center',
    },
    image: {
        height: Height * 0.27,
        width: Height * 0.27,
    },
    name: {
        fontSize: 30,
        fontWeight: '500'
    },
    card: {
        width: Width * 0.9,
        backgroundColor: '#179139',
        height: Height * 0.3,
        alignSelf: 'center',
        borderRadius: 20,
        alignItems: 'center',
        paddingTop: 10,
        marginTop: Height * 0.01
    },
    bg: {
        flexDirection: 'row'
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: Width * 0.8,
        alignItems: 'center',
        padding: 12
    },
    text: {
        color: '#fff',
        fontWeight: '500'
    },
    text1: {
        color: '#fff',
    },
    middle: {
        width: Width * 0.65,
        padding: 10,
        paddingHorizontal: 16,
        backgroundColor: "#52A96A",
        borderRadius: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Width * 0.25,
        backgroundColor: '#179139',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderRadius: 10,
        paddingVertical: 7
    },
    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Width,
        justifyContent: 'space-evenly',
        marginVertical: Height * 0.03
    },
    font: {
        fontSize: 20,
        color: '#fff'
    }


})

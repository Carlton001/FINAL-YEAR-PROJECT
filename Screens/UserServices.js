import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { FIRESTORE_DB } from '../Firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UserServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(FIRESTORE_DB, 'providers'),
        where('postedByEmail', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);

      const servicesData = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({ id: doc.id, ...doc.data() });
      });

      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIRESTORE_DB, 'providers', serviceId));
              setServices((prev) => prev.filter((item) => item.id !== serviceId));
              console.log('Service deleted successfully');
            } catch (error) {
              console.error('Error deleting service:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No services posted yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.serviceItem}>
          <View>
            <Text style={styles.serviceName}>{item.servicename}</Text>
            <Text>{item.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteService(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  serviceName: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserServices;

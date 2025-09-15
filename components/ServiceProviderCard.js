import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

const Height = Dimensions.get("window").height;
const Width = Dimensions.get("window").width;

const ServiceProviderCard = ({ provider, navigation }) => {
  const handleOpenChat = () => {
    if (!provider.postedById) {
      console.warn("⚠️ Provider UID missing");
      return;
    }
    navigation.navigate("ChatRoom", { providerId: provider.postedById });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleOpenChat}>
      {/* Top Row */}
      <View style={styles.headerRow}>
        <Image
          source={{
            uri:
              provider.profileImage ||
              "https://via.placeholder.com/60", // fallback avatar
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{provider.servicename}</Text>
          {provider.distance && (
            <Text style={styles.distance}>{provider.distance.toFixed(2)} km away</Text>
          )}
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.detailsRow}>
        <View style={styles.chip}>
          <Ionicons name="location" color="#179139" size={16} />
          <Text style={styles.chipText}>{provider.location}</Text>
        </View>
        <View style={styles.chip}>
          <Ionicons name="briefcase" color="#179139" size={16} />
          <Text style={styles.chipText}>{provider.service}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Width * 0.9,
    backgroundColor: "#fff",
    alignSelf: "center",
    padding: 16,
    borderRadius: 14,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // for Android shadow
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  distance: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 14,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 6,
  },
  chipText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
});

export default ServiceProviderCard;

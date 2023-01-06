import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { React, useState } from "react";
import * as Icon from "react-native-feather";
import { firestore } from "../firebase";
import {
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Search = () => {
  const [search, setSearch] = useState("");

  const [usersList, setUsersList] = useState([]);

  const getSearchData = async () => {
    // Get all users from firestore and store them
    try {
      let users = [];
      const usersDataDocRef = collection(firestore, "users");
      const usersDataQuery = query(
        usersDataDocRef,
        orderBy("fristName", "asc")
      );
      const querySnapshot = await getDocs(usersDataQuery);
      querySnapshot.forEach((user) => {
        users.push(user.data());
      });
      setUsersList(users);
      console.log(users);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon.Search width={15} height={15} stroke="#A7A7A7" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor="#A7A7A7"
          autoCapitalize="none"
          value={search}
          onChangeText={(text) => {
            setSearch(text), getSearchData();
          }}
        />
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: 30,
            height: 30,
            display: search == "" ? "none" : "flex",
          }}
          activeOpacity={1}
          onPress={() => setSearch("")}
        >
          <Icon.X width={15} height={15} stroke="#A7A7A7" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Recherche</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F2F2",
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginStart: 10,
    fontSize: 16,
    height: 40,
  },
});

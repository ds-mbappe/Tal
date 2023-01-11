import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { React, useCallback, useRef, useState } from "react";
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

  const [refreshing, setRefreshing] = useState(false);

  const reference = useRef(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  const searchRenderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.renderItem}
        activeOpacity={1}
        onPress={() => navigateToClickedUserProfile(item.id)}
      >
        <View style={styles.renderItemLeft}>
          <Image
            style={styles.profilePicture}
            source={{ uri: item.profilePicture }}
          />
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>
              {item.firstName + " " + item.lastName}
            </Text>
            <Text style={styles.talcsign}>{item.talcsign}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const navigateToClickedUserProfile = (id) => {
    // if (id == auth.currentUser.uid) {
    //   navigation.navigate("ProfileStack", { screen: "Profile" });
    // } else {
    //   navigation.push("GeneralUserProfile", { userId: id });
    // }
    navigation.push("GeneralUserProfile", { userId: id });
  };

  const getSearchData = async (text) => {
    // Get all users from firestore and store them
    try {
      let users = [];
      const usersDataDocRef = collection(firestore, "users");
      const usersDataQuery = query(
        usersDataDocRef,
        where("talcsign", ">=", text),
        where(
          "talcsign",
          "<",
          search.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) - 1))
        ),
        orderBy("talcsign", "asc")
      );
      const querySnapshot = await getDocs(usersDataQuery);
      querySnapshot.forEach((user) => {
        users.push(user.data());
      });
      //console.log(users);
      setUsersList(users);
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
            setSearch(text), getSearchData(text);
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
      {search !== "" ? (
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <FlatList
            contentContainerStyle={{ backgroundColor: "white" }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ref={reference}
            data={usersList}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => {
              return (
                <View
                  style={{
                    width: "100%",
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F2F2",
                  }}
                ></View>
              );
            }}
            renderItem={searchRenderItem}
          />
        </View>
      ) : (
        <></>
      )}
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
  renderItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 70,
    padding: 10,
  },
  renderItemLeft: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  details: {
    marginStart: 10,
  },
  name: {
    maxWidth: 150,
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  talcsign: {
    fontSize: 14,
    color: "#A7A7A7",
  },
});

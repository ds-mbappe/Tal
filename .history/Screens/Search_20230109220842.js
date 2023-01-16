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
import { React, useCallback, useEffect, useRef, useState } from "react";
import * as Icon from "react-native-feather";
import { auth, firestore } from "../firebase";
import {
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Search = ({ navigation }) => {
  const [search, setSearch] = useState("");

  const [usersList, setUsersList] = useState([]);

  const [posts, setPosts] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const [featuredImage, setFeaturedImage] = useState("");

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

  const PostItem = ({ item }) => {
    return (
      <View
        style={{
          padding: 15,
          flexDirection: "column",
          textAlign: "justify",
        }}
      >
        <View style={styles.postUserInfo}>
          <TouchableOpacity
            style={styles.postUserInfoLeft}
            onPress={() => goToGeneralUserProfile(item.postOwnerId)}
          >
            <View style={styles.postPhotoContainer}>
              <Image
                style={styles.postUserPhoto}
                source={{ uri: item.postOwnerProfilePicture }}
              />
            </View>
            <View style={styles.postUserNameContainer}>
              <Text style={styles.postUserName}>
                {item.postOwnerFirstName + " " + item.postOwnerLastName}
              </Text>
              <Text style={styles.postUserDate}>
                {getElapsedTime(item.postPublishedTime)}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.postMoreContainer}>
            <TouchableOpacity>
              <Icon.MoreVertical
                style={{}}
                width={20}
                height={20}
                stroke="black"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.postText}>{item.postActualText}</Text>
        {item.postImages.length > 0 ? (
          <FlatList
            contentContainerStyle={{}}
            horizontal={true}
            data={item.postImages}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  borderColor: "#F1F2F2",
                  borderWidth: 1,
                  marginStart: 55,
                  marginEnd: 20,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
                activeOpacity={1}
                onPress={() => toggleModalAndSetImage(item)}
              >
                <Image
                  style={styles.postImage}
                  source={{
                    uri: item,
                  }}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <></>
        )}
        <View style={styles.postButtons}>
          <View style={styles.postButton}>
            <TouchableOpacity
              onPress={() => likePost(item.id)}
              disabled={
                item.postDislikes.includes(auth.currentUser.uid) ? true : false
              }
            >
              {!item.postLikes.includes(auth.currentUser.uid) ? (
                <MaterialCommunityIcons
                  name="heart-outline"
                  size={20}
                  color="black"
                />
              ) : (
                <MaterialCommunityIcons
                  name="heart"
                  size={20}
                  color="#F7941D"
                />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: "black" }}>
              {" " + item.postLikes.length}
            </Text>
          </View>
          <View style={styles.postButton}>
            <TouchableOpacity
              onPress={() => dislikePost(item.id)}
              disabled={
                item.postLikes.includes(auth.currentUser.uid) ? true : false
              }
            >
              {!item.postDislikes.includes(auth.currentUser.uid) ? (
                <MaterialCommunityIcons
                  name="heart-broken-outline"
                  size={20}
                  color="black"
                />
              ) : (
                <MaterialCommunityIcons
                  name="heart-broken"
                  size={20}
                  color="#F7941D"
                />
              )}
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: "black" }}>
              {" " + item.postDislikes.length}
            </Text>
          </View>
          <View style={styles.postButton}>
            <TouchableOpacity
              onPress={() => {
                goToCommentariesPage(item.id);
              }}
            >
              <FontAwesome name="comment-o" size={20} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: "black" }}>
              {" " + item.postCommentsNumber}
            </Text>
          </View>
          <View style={styles.postButton}>
            <TouchableOpacity>
              <Icon.Repeat style={{}} width={20} height={20} stroke="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: "black" }}>
              {" " + item.postRetalcs.length}
            </Text>
          </View>
          <View style={styles.postButton}>
            <TouchableOpacity onPress={() => sharePost(item.id)}>
              <Icon.Share style={{}} width={20} height={20} stroke="black" />
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          onBackdropPress={toggleModal}
          isVisible={modalVisibility}
          backdropOpacity={1}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              position: "absolute",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <View>
              <Image
                style={{ aspectRatio: 1, width: "100%", flex: 1 }}
                source={{ uri: featuredImage }}
              />
            </View>
          </View>
        </Modal>
      </View>
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
    let strlength = text.length;
    let strFrontCode = text.slice(0, strlength - 1);
    let strEndCode = text.slice(strlength - 1, strlength);
    let endcode =
      strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
    try {
      let users = [];
      const usersDataDocRef = collection(firestore, "users");
      const usersDataQuery = query(
        usersDataDocRef,
        where("firstName", ">=", text),
        where("firstName", "<", endcode),
        orderBy("firstName", "asc")
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

  const getPostData = async () => {
    try {
      let posts = [];
      const postDataDocRef = collection(firestore, "posts");
      const postDataQuery = query(
        postDataDocRef,
        orderBy("postPublishedTime", "desc")
      );
      const querySnapshot = await getDocs(postDataQuery);
      querySnapshot.forEach((post) => {
        posts.push(post.data());
      });
      setPosts(posts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPostData();
  }, []);

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
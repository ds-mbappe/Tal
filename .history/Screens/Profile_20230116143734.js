import { useEffect, React, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
  Share,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { postData } from "../data";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { auth, firestore } from "../firebase";
import * as Icon from "react-native-feather";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import {
  where,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  orderBy,
  arrayUnion,
  query,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useScrollToTop } from "@react-navigation/native";

const Profile = ({ route, navigation }) => {
  const reference = useRef(null);

  const Header_Min_Height = 0;

  const Header_Max_Height = 330;

  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  const [index, setIndex] = useState(0);

  const [userData, setUserData] = useState({});

  const [currentUserFollowers, setCurrentUserFollowers] = useState(0);

  const [currentUserFollowing, setCurrentUserFollowing] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const [connectedUserPosts, setConnectedUserPosts] = useState([]);

  const [modalVisibility, setModalVisibility] = useState(false);

  const [featuredImage, setFeaturedImage] = useState("");

  const [routes] = useState([
    { key: "first", title: "Posts" },
    { key: "second", title: "Likes/Dislikes" },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  const toggleModal = () => {
    setModalVisibility(!modalVisibility);
  };

  const toggleModalAndSetImage = (imageUrl) => {
    toggleModal();
    setFeaturedImage(imageUrl);
  };

  const emptyListElement = () => {
    return (
      <View
        style={{
          flex: 1,
          marginTop: "40%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Aucune publication pour le moment !</Text>
      </View>
    );
  };

  const likePost = async (postId) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDocSnapshot = await getDoc(postDocRef);
      if (postDocSnapshot.exists()) {
        if (postDocSnapshot.data().postLikes.includes(auth.currentUser.uid)) {
          try {
            await updateDoc(postDocRef, {
              postLikes: arrayRemove(auth.currentUser.uid),
            });
            getData();
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postLikes: arrayUnion(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log("The document does not exist !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dislikePost = async (postId) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDocSnapshot = await getDoc(postDocRef);
      if (postDocSnapshot.exists()) {
        if (
          postDocSnapshot.data().postDislikes.includes(auth.currentUser.uid)
        ) {
          try {
            await updateDoc(postDocRef, {
              postDislikes: arrayRemove(auth.currentUser.uid),
            });
            getData();
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postDislikes: arrayUnion(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log("The document does not exist !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goToCommentariesPage = async (postId) => {
    // Get all comments from Firestore and store them
    try {
      let comments = [];
      const commentDataDocRef = collection(firestore, "comments");
      const commentDataQuery = query(
        commentDataDocRef,
        where("commentRelatedPostId", "==", postId),
        orderBy("commentPublishedTime", "desc")
      );
      await getDocs(commentDataQuery).then(async (querySnapshot) => {
        querySnapshot.forEach((post) => {
          comments.push(post.data());
        });
        await AsyncStorage.setItem("@postId", postId).then(() => {
          navigation.navigate("CommentPage", { postComments: comments });
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const sharePost = async (postId) => {
    try {
      const result = await Share.share({
        message: postId,
      });
      // if (result.action === Share.sharedAction) {
      //   if (result.activityType) {
      //   } else {
      //   }
      // } else if (result.action === Share.dismissedAction) {
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const FirstRoute = () => {
    const firstReference = useRef(null);

    useScrollToTop(firstReference);

    return (
      <FlatList
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{}}
        ref={firstReference}
        data={connectedUserPosts}
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
        ListEmptyComponent={emptyListElement}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                padding: 15,
                flexDirection: "column",
                textAlign: "justify",
              }}
            >
              <View style={styles.postUserInfo}>
                <TouchableOpacity style={styles.postUserInfoLeft}>
                  <View style={styles.postPhotoContainer}>
                    <Image
                      style={styles.postUserPhoto}
                      source={{
                        uri: item.postOwnerProfilePicture,
                      }}
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
                      item.postDislikes.includes(auth.currentUser.uid)
                        ? true
                        : false
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
                      item.postLikes.includes(auth.currentUser.uid)
                        ? true
                        : false
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
                    <Icon.Repeat
                      style={{}}
                      width={20}
                      height={20}
                      stroke="black"
                    />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, color: "black" }}>
                    {" " + item.postRetalcs.length}
                  </Text>
                </View>
                <View style={styles.postButton}>
                  <TouchableOpacity onPress={() => sharePost(item.id)}>
                    <Icon.Share
                      style={{}}
                      width={20}
                      height={20}
                      stroke="black"
                    />
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
        }}
      />
    );
  };

  const SecondRoute = () => (
    <FlatList
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
        { useNativeDriver: false }
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{}}
      ref={reference}
      data={postData}
      renderItem={({ item }) => (
        <Text
          style={{
            marginTop: 10,
            marginEnd: 20,
            marginBottom: 10,
            marginStart: 20,
            textAlign: "justify",
          }}
        >
          {item.text}
        </Text>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const animateHeaderOpacity = scrollOffsetY.interpolate({
    inputRange: [0, Header_Max_Height - Header_Min_Height],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const animateHeaderHeight = scrollOffsetY.interpolate({
    inputRange: [0, Header_Max_Height - Header_Min_Height],
    outputRange: [Header_Max_Height, Header_Min_Height],
    extrapolate: "clamp",
  });

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToSettings = () => {
    navigation.navigate("ProfileStack", {
      screen: "Settings",
      navigationOptions: { tabBarVisible: false },
    });
  };

  const navigateToFollowers = () => {
    navigation.navigate("AccountStats", {
      tabName: "Abonnés",
      userId: auth.currentUser.uid,
    });
  };

  const navigateToFollowing = () => {
    navigation.navigate("AccountStats", {
      tabName: "Abonnements",
      userId: auth.currentUser.uid,
    });
  };

  const userStatsListener = onSnapshot(
    doc(firestore, "users", auth.currentUser.uid),
    (element) => {
      setCurrentUserFollowers(element.data().followers.length);
      setCurrentUserFollowing(element.data().following.length);
    }
  );

  const getElapsedTime = (time) => {
    const postDate = new Date(time);

    let today = new Date();

    let diff = today.getTime() - postDate.getTime();

    let secondsElapsed = Math.floor(diff) / 1000;

    if (secondsElapsed > 0 && secondsElapsed < 60) {
      if (secondsElapsed == 1) {
        return "Il y'a " + Math.round(secondsElapsed) + " seconde";
      }
      return "Il y'a " + Math.round(secondsElapsed) + " secondes";
    } else if (secondsElapsed >= 60 && secondsElapsed < 3600) {
      if (secondsElapsed >= 60 && secondsElapsed < 120) {
        return "Il y'a " + Math.round(secondsElapsed / 60) + " minute";
      }
      return "Il y'a " + Math.round(secondsElapsed / 60) + " minutes";
    } else if (secondsElapsed >= 3600 && secondsElapsed < 86400) {
      if (secondsElapsed >= 3600 && secondsElapsed < 7200) {
        return "Il y'a " + Math.round(secondsElapsed / 3600) + " heure";
      }
      return "Il y'a " + Math.round(secondsElapsed / 3600) + " heures";
    } else if (secondsElapsed >= 86400 && secondsElapsed < 604800) {
      if (secondsElapsed >= 86400 && secondsElapsed < 172800) {
        return "Il y'a " + Math.round(secondsElapsed / 86400) + " jour";
      }
      return "Il y'a " + Math.round(secondsElapsed / 86400) + " jours";
    } else if (secondsElapsed >= 604800 && secondsElapsed < 2419200) {
      if (secondsElapsed >= 604800 && secondsElapsed < 1209600) {
        return "Il y'a " + Math.round(secondsElapsed / 604800) + " semaine";
      }
      return "Il y'a " + Math.round(secondsElapsed / 604800) + " semaines";
    }
  };

  const getData = async () => {
    // Get all posts of the connected user from Firestore and store them
    try {
      let posts = [];
      const postDataDocRef = collection(firestore, "posts");
      const postDataQuery = query(
        postDataDocRef,
        where("postOwnerId", "==", auth.currentUser.uid),
        orderBy("postPublishedTime", "desc")
      );
      const querySnapshot = await getDocs(postDataQuery);
      querySnapshot.forEach((post) => {
        posts.push(post.data());
      });
      setConnectedUserPosts(posts);
      //console.log(postsPictures);
    } catch (error) {
      console.log(error);
    }
    // get connected user data
    try {
      const connectedUserDocRef = doc(firestore, "users", auth.currentUser.uid);
      const connectedUserDocSnapshot = await getDoc(connectedUserDocRef);
      if (connectedUserDocSnapshot.exists()) {
        setUserData(connectedUserDocSnapshot.data());
        setCurrentUserFollowers(
          connectedUserDocSnapshot.data().followers.length
        );
        setCurrentUserFollowing(
          connectedUserDocSnapshot.data().following.length
        );
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //   }, [])
  // );

  useEffect(() => {
    getData();
  }, []);

  if (Object.keys(userData).length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          alignItems: "center",
          backgroundColor: "white",
          left: 0,
          right: 0,
          height: animateHeaderHeight,
          opacity: animateHeaderOpacity,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 46,
            borderBottomColor: "#F1F2F2",
            borderBottomWidth: 1,
          }}
        >
          <TouchableOpacity onPress={navigateToEditProfile}>
            <Icon.Edit3
              style={{ marginStart: 20 }}
              width={25}
              height={25}
              stroke="black"
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {userData.firstName + " " + userData.lastName}
          </Text>
          <TouchableOpacity onPress={navigateToSettings}>
            <Icon.Settings
              style={{ marginEnd: 20 }}
              width={25}
              height={25}
              stroke="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.userBio}>
          <View style={styles.userBioTop}>
            <View style={styles.userStat}>
              <TouchableOpacity
                style={{ display: "flex", alignItems: "center" }}
                onPress={navigateToFollowers}
              >
                <Text style={styles.statValue}>{currentUserFollowers}</Text>
                <Text>Abonnés</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: "31.5%", marginBottom: 5 }}>
              <CircularProgressBase
                rotation={180}
                value={45}
                maxValue={100}
                radius={60}
                clockwise={true}
                inActiveStrokeOpacity={0}
                inActiveStrokeWidth={6}
                activeStrokeWidth={6}
                activeStrokeColor="#F7941D"
              >
                <CircularProgressBase
                  rotation={180}
                  value={25}
                  maxValue={100}
                  radius={60}
                  clockwise={false}
                  inActiveStrokeOpacity={0}
                  inActiveStrokeWidth={6}
                  activeStrokeWidth={6}
                  activeStrokeColor="#000000"
                  children={
                    <View>
                      <View style={styles.photoContainer}>
                        <Image
                          style={styles.image}
                          source={{
                            uri: userData.profilePicture,
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          left: 35,
                          bottom: -20,
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          borderColor: "white",
                          borderWidth: 2,
                          backgroundColor: "#E94E1B",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 20,
                            fontWeight: "bold",
                          }}
                        >
                          S
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              </CircularProgressBase>
            </View>
            <View style={styles.userStat}>
              <TouchableOpacity
                style={{ display: "flex", alignItems: "center" }}
                onPress={navigateToFollowing}
              >
                <Text style={styles.statValue}>{currentUserFollowing}</Text>
                <Text>Abonnements</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userBioBottom}>
            <Text style={styles.talText}>{userData.talcsign}</Text>
            <Text style={styles.bioText}>{userData.bio}</Text>
          </View>
        </View>
      </Animated.View>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: "white",
        }}
      >
        <TabView
          renderTabBar={(props) => {
            return (
              <TabBar
                {...props}
                renderLabel={({ route, focused, color }) => (
                  <Text
                    style={
                      focused
                        ? {
                            width: "100%",
                            color: "#0C0C0C",
                            margin: 5,
                            fontWeight: "bold",
                          }
                        : { color: "#0C0C0C", margin: 5 }
                    }
                  >
                    {route.title}
                  </Text>
                )}
                indicatorStyle={{ backgroundColor: "#FF6600" }}
                style={{ backgroundColor: "white" }}
              />
            );
          }}
          style={{ flexGrow: 1, height: "100%" }}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    marginTop: 46,
    backgroundColor: "white",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
  },
  userClass: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    // borderColor: "red",
    // borderWidth: 1,
  },
  talText: {
    width: "100%",
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  bioText: {
    fontSize: 14,
    color: "#0C0C0C",
    alignSelf: "center",
    textAlign: "center",
    marginTop: 10,
    // borderColor: "red",
    // borderWidth: 1,
  },
  userBio: {
    width: "100%",
    flexDirection: "column",
    padding: 20,
    alignItems: "center",
  },
  userBioTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  userBioBottom: {
    width: "100%",
    flexDirection: "column",
  },
  photoContainer: {
    width: 100,
    // borderColor: "red",
    // borderWidth: 1,
    flexDirection: "column",
  },
  detailContainer: {
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
  },
  userStats: {
    padding: 10,
    width: "100%",
    // borderWidth: 1,
    // borderColor: "red",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  userStat: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
    // borderWidth: 1,
    // borderColor: "red",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    // borderWidth: 1,
    // borderColor: "red",
  },
  postUserInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postUserInfoLeft: {
    flexDirection: "row",
  },
  postPhotoContainer: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  postUserPhoto: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
  },
  postUserNameContainer: {
    flexDirection: "column",
    // borderColor: "red",
    // borderWidth: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0C0C0C",
  },
  postUserDate: {
    fontSize: 14,
    color: "gray",
  },
  postMoreContainer: {
    // borderColor: "red",
    // borderWidth: 1,
  },
  postText: {
    fontSize: 18,
    color: "#0C0C0C",
    marginTop: 10,
    marginStart: 55,
    marginBottom: 10,
    textAlign: "justify",
  },
  postImageContainer: {
    flexGrow: 1,
  },
  postImage: {
    aspectRatio: 1,
    width: "150%",
    flex: 1,
    // width: 252,
    // height: 252,
    // borderColor: "#F1F2F2",
    // borderWidth: 1,
  },
  postButtons: {
    // borderColor: "red",
    // borderWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  postButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
});

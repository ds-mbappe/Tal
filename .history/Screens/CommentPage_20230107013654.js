import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import React from "react";
import { uuidv4 } from "@firebase/util";
import * as Icon from "react-native-feather";
import { useState, useCallback, useRef } from "react";
import { auth, firestore } from "../firebase";
import {
  query,
  where,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  orderBy,
  runTransaction,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const CommentPage = ({ route, navigation }) => {
  const { postComments } = route.params;

  const reference = useRef(null);

  const [comment, setComment] = useState("");

  const [allComments, setAllComments] = useState([]);

  const [selectedPostId, setSelectedPostId] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [oldUserData, setUserData] = useState({});

  const commentItem = ({ item }) => {
    return (
      <View
        key={item.key}
        style={{
          paddingVertical: 15,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <TouchableOpacity
          onPress={() => navigateToGeneralUserProfile(item.commentOwnerId)}
        >
          <Image
            style={styles.commentPhoto}
            source={{ uri: item.commentOwnerProfilePicture }}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginStart: 10,
            marginEnd: 10,
          }}
        >
          <TouchableOpacity
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            onPress={() => navigateToGeneralUserProfile(item.commentOwnerId)}
          >
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              {item.commentOwnerTalcsign}
            </Text>
          </TouchableOpacity>
          <Text style={{ textAlign: "justify" }}>{item.commentActualText}</Text>
          <Text style={{ textAlign: "justify", fontSize: 12, color: "gray" }}>
            {getElapsedTime(item.commentPublishedTime)}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              margin: 25,
              textAlign: "center",
              borderColor: "red",
              borderWidth: 1,
            }}
          >
            {item.commentLikes.length}
          </Text>
          <TouchableOpacity onPress={() => likeComment(item.id)}>
            {item.commentLikes.includes(auth.currentUser.uid) ? (
              <Icon.Heart
                width={20}
                height={20}
                fill="#F7941D"
                stroke="#F7941D"
              />
            ) : (
              <Icon.Heart width={20} height={20} stroke="black" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const likeComment = async (commentId) => {
    try {
      const commentsRef = doc(firestore, "comments", commentId);
      const commentSnapshot = await getDoc(commentsRef);
      if (commentSnapshot.data().commentLikes.includes(auth.currentUser.uid)) {
        updateDoc(commentsRef, {
          commentLikes: arrayRemove(auth.currentUser.uid),
        });
        getPostId();
      } else {
        updateDoc(commentsRef, {
          commentLikes: arrayUnion(auth.currentUser.uid),
        });
        getPostId();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getElapsedTime = (time) => {
    const postDate = new Date(time);

    let today = new Date();

    let diff = today.getTime() - postDate.getTime();

    let secondsElapsed = Math.floor(diff) / 1000;

    if (secondsElapsed > 0 && secondsElapsed < 60) {
      if ((secondsElapsed = 1)) {
        return Math.round(secondsElapsed) + " seconde";
      }
      return Math.round(secondsElapsed) + " secondes";
    } else if (secondsElapsed >= 60 && secondsElapsed < 3600) {
      if (secondsElapsed >= 60 && secondsElapsed < 120) {
        return Math.round(secondsElapsed / 60) + " minute";
      }
      return Math.round(secondsElapsed / 60) + " minutes";
    } else if (secondsElapsed >= 3600 && secondsElapsed < 86400) {
      if (secondsElapsed >= 3600 && secondsElapsed < 7200) {
        return Math.round(secondsElapsed / 3600) + " heure";
      }
      return Math.round(secondsElapsed / 3600) + " heures";
    } else if (secondsElapsed >= 86400 && secondsElapsed < 604800) {
      if (secondsElapsed >= 86400 && secondsElapsed < 172800) {
        return Math.round(secondsElapsed / 86400) + " jour";
      }
      return Math.round(secondsElapsed / 86400) + " jours";
    } else if (secondsElapsed >= 604800 && secondsElapsed < 2419200) {
      if (secondsElapsed >= 604800 && secondsElapsed < 1209600) {
        return Math.round(secondsElapsed / 604800) + " semaine";
      }
      return Math.round(secondsElapsed / 604800) + " semaines";
    }
  };

  const saveCommentData = async () => {
    // Save comment data
    try {
      const commentId = uuidv4();
      const postDocRef = doc(firestore, "comments", commentId);
      await setDoc(postDocRef, {
        id: commentId,
        commentOwnerId: auth.currentUser.uid,
        commentRelatedPostId: selectedPostId,
        commentOwnerFirstName: oldUserData.firstName,
        commentOwnerLastName: oldUserData.lastName,
        commentOwnerTalcsign: oldUserData.talcsign,
        commentOwnerProfilePicture: oldUserData.profilePicture,
        commentActualText: comment,
        commentLikes: [],
        commentPublishedTime: new Date().getTime(),
      });
      console.log("Commentaire publié avec succès !");
      onRefresh();
      setComment("");
    } catch (error) {
      console.log(error);
    }
    // Update PostCommentNumber
    try {
      const postDocRef = doc(firestore, "posts", selectedPostId);
      await runTransaction(firestore, async (transaction) => {
        const doc = await transaction.get(postDocRef);
        if (!doc.exists()) {
          console.log("Documment does not exist!");
        }
        const newPostCommentNumber = doc.data().postCommentsNumber + 1;
        transaction.update(postDocRef, {
          postCommentsNumber: newPostCommentNumber,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToGeneralUserProfile = (userId) => {
    // if (userId == auth.currentUser.uid) {
    //   navigation.navigate("ProfileStack", { screen: "Profile" });
    // } else {
    //   navigation.push("GeneralUserProfile", { userId: userId });
    // }
    navigation.push("GeneralUserProfile", { userId: userId });
  };

  const getPostId = async () => {
    // Get connected user data
    try {
      const connectedUserDocRef = doc(firestore, "users", auth.currentUser.uid);
      const connectedUserDocSnapshot = await getDoc(connectedUserDocRef);
      if (connectedUserDocSnapshot.exists()) {
        setUserData(connectedUserDocSnapshot.data());
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
    // Get selected post Id from AsyncStorage
    try {
      await AsyncStorage.getItem("@postId").then(async (postId) => {
        setSelectedPostId(postId);
        // Get all comments from Firestore and store them
        try {
          let comments = [];
          const commentDataDocRef = collection(firestore, "comments");
          const commentDataQuery = query(
            commentDataDocRef,
            where("commentRelatedPostId", "==", postId),
            orderBy("commentPublishedTime", "desc")
          );
          await getDocs(commentDataQuery).then((querySnapshot) => {
            querySnapshot.forEach((post) => {
              comments.push(post.data());
            });
            setAllComments(comments);
          });
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getPostId();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  // useFocusEffect(
  //   useCallback(() => {
  //   }, [])
  // );

  useEffect(() => {
    setAllComments(postComments);
    getPostId();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          backgroundColor: "white",
          marginBottom: 46,
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon.ChevronLeft
              style={{ marginStart: 10 }}
              width={25}
              height={25}
              stroke="#F7941D"
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Commentaires</Text>
          <View style={{ width: 25, height: 25, marginEnd: 10 }}></View>
        </View>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={100}
          contentContainerStyle={styles.credentials}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            ref={reference}
            data={allComments}
            keyExtractor={(item) => uuidv4()}
            contentContainerStyle={{ flexGrow: 1, margin: 10 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
            renderItem={commentItem}
          />
          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: "white",
              paddingStart: 10,
              paddingEnd: 10,
              paddingTop: 10,
              paddingBottom: 10,
              borderTopColor: "#F1F2F2",
              borderTopWidth: 1,
            }}
          >
            <Image
              style={styles.postUserPhoto}
              source={{ uri: oldUserData.profilePicture }}
            />
            <TextInput
              style={{
                width: "70%",
                height: 40,
                paddingStart: 15,
                paddingEnd: 15,
                borderRadius: 30,
                borderColor: "#A7A7A7",
                borderWidth: 1,
              }}
              value={comment}
              onChangeText={(text) => setComment(text)}
              //keyboardType="twitter"
              placeholder={`Tapez un commentaire...`}
            />
            <TouchableOpacity
              style={[
                styles.publishBtn,
                {
                  opacity: comment == "" ? 0.5 : 1,
                },
              ]}
              disabled={comment == "" ? true : false}
              onPress={saveCommentData}
            >
              <Text style={styles.publishBtnText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default CommentPage;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    position: "relative",
    backgroundColor: "white",
  },
  credentials: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  postUserPhoto: {
    width: 40,
    height: 40,
    marginEnd: 10,
    borderRadius: 40 / 2,
  },
  commentPhoto: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  publishBtn: {
    height: 40,
    marginStart: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  publishBtnText: {
    color: "#F7941D",
    fontSize: 16,
    fontWeight: "bold",
  },
});

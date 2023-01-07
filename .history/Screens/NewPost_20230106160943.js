import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { uuidv4 } from "@firebase/util";
import { useState, useCallback } from "react";
import { auth, storage, firestore } from "../firebase";
import * as Icon from "react-native-feather";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from "react-native-modal";

const NewPost = ({ navigation }) => {
  let idPost = "";
  let images = [];
  const [postText, setPostText] = useState("");
  const [selectedPostImages, setSelectedPostImages] = useState([]);
  const [oldUserData, setUserData] = useState({});
  const [postVisibility, setPostVisibility] = useState(false);
  const [postId, setPostId] = useState("");
  const [loading, setLoading] = useState(false);
  const [textCharCount, setTextCharCount] = useState(0);
  const [modalMediaVisibility, setModalMediaVisibility] = useState(false);

  const uploadImageAsync = async (image) => {
    const postPicturesRef = ref(
      storage,
      "postPictures/" + idPost + "/" + image.fileName
    );
    // Upload Image to Storage
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image.uri, true);
        xhr.send(null);
      });
      await uploadBytes(postPicturesRef, blob, { contentType: "image/jpeg" })
        .then(async () => {
          await getDownloadURL(postPicturesRef).then(async (url) => {
            // Update the images array with the new images URL
            images.push(url);
            await updatePostImagesEntry();
          });
          // We're done with the blob, close and release it
          blob.close();
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updatePostImagesEntry = async () => {
    try {
      const postDocRef = doc(firestore, "posts", idPost);
      await updateDoc(postDocRef, {
        postImages: images,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const publishPost = async () => {
    try {
      if (postText != "") {
        setLoading(true);
        const postId = uuidv4();
        idPost = postId;
        const postDocRef = doc(firestore, "posts", postId);
        await setDoc(postDocRef, {
          id: postId,
          postOwnerId: auth.currentUser.uid,
          postOwnerFirstName: oldUserData.firstName,
          postOwnerLastName: oldUserData.lastName,
          postOwnerProfilePicture: oldUserData.profilePicture,
          postActualText: postText,
          postLikes: [],
          postDislikes: [],
          postRetalcs: [],
          // postLikeNumber: 0,
          // postDislikeNumber: 0,
          // postRetalcsNumber: 0,
          postPublishedTime: new Date(),
          postCommentsNumber: 0,
          postImages: [],
        });
        selectedPostImages.forEach(async (image) => {
          await uploadImageAsync(image).then(() => {
            console.log("Image publiée avec succès !");
          });
        });
        setTimeout(() => {
          setLoading(false);
          setPostText("");
          setSelectedPostImages([]);
          console.log("Post publié avec succès !");
          navigation.navigate("HomeStack", { screen: "Feed" });
        }, 1250);
      } else {
        alert("Le texte du post ne peut être vide !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMediaModal = () => {
    setModalMediaVisibility(!modalMediaVisibility);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 4],
      quality: 1,
      videoQuality: 1,
      videoMaxDuration: 30,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      toggleMediaModal();
      setSelectedPostImages(result.assets);
    }
  };

  const deletePostMedia = () => {
    setSelectedPostImages([]);
    toggleMediaModal();
  };

  const goToCameraPage = () => {
    toggleMediaModal();
    console.log("Camera Page");
  };

  const navigateToFeed = () => {
    navigation.navigate("HomeStack", { screen: "Feed" });
  };

  const toggleVisibility = () => {
    setPostVisibility(!postVisibility);
  };

  const getData = async () => {
    try {
      const connectedUserDocRef = doc(firestore, "users", auth.currentUser.uid);
      const connectedUserDocSnapshot = await getDoc(connectedUserDocRef);
      if (connectedUserDocSnapshot.exists()) {
        setUserData(connectedUserDocSnapshot.data());
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log("Error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  if (loading == true) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text style={{ marginBottom: 10 }}>Publication en cours...</Text>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={50}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
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
            <TouchableOpacity>
              <Icon.Trash2
                style={{ marginStart: 10 }}
                width={25}
                height={25}
                stroke="white"
              />
            </TouchableOpacity>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Nouvelle publication
            </Text>
            <TouchableOpacity onPress={navigateToFeed}>
              <Icon.Trash2
                style={{ marginEnd: 10 }}
                width={25}
                height={25}
                stroke="#F7941D"
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
              }}
            >
              <TextInput
                style={styles.postText}
                placeholder="Tapez votre texte ici"
                value={postText}
                onChangeText={(text) => {
                  setTextCharCount(text.length), setPostText(text);
                }}
                multiline={true}
                maxLength={700}
              />
              <View>
                {selectedPostImages.length > 0 ? (
                  <FlatList
                    horizontal={true}
                    data={selectedPostImages}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.assetId}
                    renderItem={({ item }) => (
                      <Image
                        style={styles.postImage}
                        source={{
                          uri: item.uri,
                        }}
                      />
                    )}
                  />
                ) : (
                  <></>
                )}
              </View>
            </ScrollView>
          </View>
          <View style={{ display: "flex", flexDirection: "column" }}>
            <View>
              <Text
                style={{
                  alignSelf: "flex-end",
                  fontWeight: "bold",
                  color: textCharCount == 700 ? "#E94E1B" : "#F7941D",
                  paddingEnd: 20,
                  paddingBottom: 10,
                }}
              >
                {textCharCount}/700
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                backgroundColor: "white",
                paddingStart: 20,
                paddingEnd: 20,
                paddingTop: 10,
                paddingBottom: 10,
                borderTopColor: "#F1F2F2",
                borderTopWidth: 1,
              }}
            >
              <View
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 30,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{ width: 20, height: 20, marginEnd: 10 }}
                  >
                    <Icon.Globe width={20} height={20} color="black" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {postVisibility === false
                      ? "Tout le monde"
                      : "Mes amis uniquement"}
                  </Text>
                  <TouchableOpacity
                    style={{ width: 20, height: 20 }}
                    onPress={toggleVisibility}
                  >
                    <Icon.RotateCw width={20} height={20} color="black" />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: "100%",
                    borderTopColor: "#F7941D",
                    borderTopWidth: 1.5,
                  }}
                ></View>
                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <TouchableOpacity style={styles.bottomButtonContainer}>
                    <Icon.Mic width={20} height={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bottomButtonContainer}
                    onPress={toggleMediaModal}
                  >
                    <Icon.Image width={20} height={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottomButtonContainer}>
                    <Icon.Gift width={20} height={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.postButtonContainer}
                onPress={publishPost}
              >
                <Icon.Send width={30} height={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            onBackdropPress={toggleMediaModal}
            isVisible={modalMediaVisibility}
          >
            <View
              style={{
                width: "100%",
                position: "absolute",
                bottom: 0,
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={goToCameraPage}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>
                    Prendre une photo/vidéo
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#f1f2f2",
                  }}
                ></View>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>
                    Importer depuis la galerie
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#f1f2f2",
                  }}
                ></View>
                <TouchableOpacity
                  onPress={deletePostMedia}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>
                    Supprimer le/les média(s)
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.modalHideButton}
                  onPress={() => setModalMediaVisibility(!modalMediaVisibility)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  postText: {
    margin: 20,
    fontSize: 18,
  },
  postImage: {
    width: 252,
    height: 336,
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  bottomButtonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#F7941D",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  postButtonContainer: {
    width: 80,
    height: 80,
    marginStart: 50,
    backgroundColor: "#F7941D",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  modalButtonContainer: {
    backgroundColor: "white",
    padding: 20,
  },
  modalHideButton: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
    borderRadius: 14,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#0C0C0C",
    textAlign: "center",
  },
});

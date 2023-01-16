import {
  Image,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Icon from "react-native-feather";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
import { countries } from "../countries";
import { AuthContext } from "../AuthProvider";
import { auth, firestore } from "../firebase";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { query, collection, doc, setDoc, getDocs } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useContext, useState, useCallback } from "react";

const Register = ({ navigation, route }) => {
  const maxBioChar = 250;
  const maxTalcsignChar = 15;

  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [talcsign, setTalcsign] = useState("");
  const [bio, setBio] = useState("");
  const [bioCharCount, setBioCharCount] = useState(0);
  const [talcsignCount, setTalcsignCount] = useState(0);
  const [profilePicture, setProfilePicture] = useState(
    "https://e7.pngegg.com/pngimages/518/64/png-clipart-person-icon-computer-icons-user-profile-symbol-person-miscellaneous-monochrome-thumbnail.png"
  );
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [secureTextEntryOne, setSecureTextEntryOne] = useState(true);
  const [secureTextEntryTwo, setSecureTextEntryTwo] = useState(true);
  const [modalVisibility, setModalVisibility] = useState(false);

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  const toggleModal = () => {
    setModalVisibility(!modalVisibility);
  };

  const goToCamerapage = () => {
    toggleModal();
    navigation.navigate("TakePicture");
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.1,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      toggleModal();
    } else if (result.canceled) {
      toggleModal();
    }
  };

  const deleteProfilePicture = async () => {
    toggleModal();
    await AsyncStorage.setItem(
      "@registerPP",
      "https://e7.pngegg.com/pngimages/518/64/png-clipart-person-icon-computer-icons-user-profile-symbol-person-miscellaneous-monochrome-thumbnail.png"
    );
    setProfilePicture(
      "https://e7.pngegg.com/pngimages/518/64/png-clipart-person-icon-computer-icons-user-profile-symbol-person-miscellaneous-monochrome-thumbnail.png"
    );
  };

  const verifyIfTalcsignExists = async (sign) => {
    try {
      let talcSignList = [];
      const usersRef = collection(firestore, "users");
      const talcsignInDocumentQuerry = query(usersRef);
      const querySnapshot = await getDocs(talcsignInDocumentQuerry);
      querySnapshot.forEach((doc) => {
        talcSignList.push(doc.data().talcsign);
      });
      return !talcSignList.includes(sign);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyPassword = (pass, confirmPass) => {
    const passwordRegEx = "^(.{0,11}|[^0-9]*|[^A-Z]*[^a-z]*|[a-zA-Z0-9]*)$";
    if (pass.match(passwordRegEx)) {
      return false;
    } else {
      if (pass === confirmPass) {
        return true;
      }
    }
  };

  const handleRegister = async () => {
    if (firstName == "" || lastName == "" || talcsign == "" || email == "") {
      Alert.alert(
        "Erreur",
        "Les champs nom, prénom, email, talcsign doivent tous être remplis !",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
    } else {
      if (verifyPassword(password, confirmPassword)) {
        let talcSignList = [];
        try {
          const usersRef = collection(firestore, "users");
          const talcsignInDocumentQuerry = query(usersRef);
          const querySnapshot = await getDocs(talcsignInDocumentQuerry);
          querySnapshot.forEach((doc) => {
            talcSignList.push(doc.data().talcsign);
          });
        } catch (error) {
          console.log(error);
        }
        if (talcSignList.includes(talcsign)) {
          alert("Ce talcign est déjà pris, choisissez-en un autre");
        } else {
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredentials) => {
              const user = userCredentials.user;
              saveDataToFirestore(user.uid);
              signInWithEmailAndPassword(auth, email, password).then(
                async (userCredentials) => {
                  const user = userCredentials.user;
                  setIsLoggedIn(true);
                  await AsyncStorage.setItem("@token", user.uid);
                }
              );
            })
            .catch((error) => {
              console.log(error.message);
              Alert.alert("Erreur", "L'adresse e-mail entrée existe déjà !", [
                {
                  text: "OK",
                  style: "default",
                },
              ]);
            });
        }
      } else {
        Alert.alert(
          "Erreur",
          "Le mot de passe doit respecter les critères:\n- Au moins 12 caractères\n- Au moins une majuscule\n- Au moins une minuscule\n- Au moins un caractère spécial",
          [
            {
              text: "OK",
              style: "default",
            },
          ]
        );
      }
    }
  };

  const saveDataToFirestore = async (userid) => {
    try {
      await setDoc(doc(firestore, "users", userid), {
        id: userid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        talcsign: "@" + talcsign,
        profilePicture: profilePicture,
        bio: bio,
        country: country,
        gender: gender,
        followers: [],
        following: [],
      });
      console.log("Document written with ID: ", userid);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const getImage = async () => {
    const image = await AsyncStorage.getItem("@registerPP");
    return image;
  };

  useFocusEffect(
    useCallback(() => {
      const getCapturedImage = async () => {
        const image = await getImage();
        if (image !== null) {
          setProfilePicture(image);
        }
      };
      getCapturedImage();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Inscription</Text>
        <View style={{ width: 25, height: 25, marginEnd: 10 }}></View>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <KeyboardAvoidingView
          behavior="position"
          style={styles.credentials}
          keyboardVerticalOffset={50}
        >
          <View style={{ marginBottom: 100 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                margin: 20,
              }}
            >
              <CircularProgressBase
                rotation={180}
                value={0}
                maxValue={100}
                radius={60}
                clockwise={true}
                inActiveStrokeOpacity={0}
                inActiveStrokeWidth={5}
                activeStrokeWidth={5}
                activeStrokeColor="#0096FF"
              >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.image}
                    source={{
                      uri: profilePicture,
                    }}
                  />
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={{
                      position: "absolute",
                      bottom: -20,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderColor: "white",
                      borderWidth: 2,
                      backgroundColor: "#F7941D",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon.Edit2 width={20} height={20} stroke="white" />
                  </TouchableOpacity>
                </View>
              </CircularProgressBase>
              <View
                style={{
                  width: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: 20,
                }}
              >
                <View
                  style={[
                    styles.bigInputContainerName,
                    {
                      borderColor: talcsign != "" ? "#F7941D" : "#F1F2F2",
                      width: "100%",
                    },
                  ]}
                >
                  <View style={styles.inputContainerName}>
                    <Text style={styles.textContainer}>TalCSign</Text>
                    <TextInput
                      style={styles.profiletextInputEmail}
                      placeholder="talcsign"
                      value={talcsign}
                      maxLength={maxTalcsignChar}
                      onChangeText={(text) => {
                        setTalcsign(text), setTalcsignCount(text.length);
                      }}
                      placeholderTextColor="gray"
                    />
                    <Text
                      style={{
                        position: "absolute",
                        bottom: -20,
                        right: 0,
                        alignSelf: "flex-end",
                        fontWeight: "bold",
                        color:
                          talcsignCount == maxTalcsignChar
                            ? "#E94E1B"
                            : "#F7941D",
                      }}
                    >
                      {talcsignCount}/{maxTalcsignChar}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  {/* <SelectDropdown
                    data={countries}
                    onSelect={(selectedItem, index) => {
                      setCountry(selectedItem);
                    }}
                    defaultButtonText={"Pays"}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    renderDropdownIcon={(isOpened) => {
                      return isOpened ? (
                        <Icon.ChevronUp
                          width={20}
                          height={20}
                          stroke="#A7A7A7"
                        />
                      ) : (
                        <Icon.ChevronDown
                          width={20}
                          height={20}
                          stroke="#A7A7A7"
                        />
                      );
                    }}
                    dropdownIconPosition={"right"}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  />
                  <SelectDropdown
                    data={["Homme", "Femme", "Autre"]}
                    onSelect={(selectedItem, index) => {
                      setGender(selectedItem);
                    }}
                    defaultButtonText={"Sexe"}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    renderDropdownIcon={(isOpened) => {
                      return isOpened ? (
                        <Icon.ChevronUp
                          width={20}
                          height={20}
                          stroke="#A7A7A7"
                        />
                      ) : (
                        <Icon.ChevronDown
                          width={20}
                          height={20}
                          stroke="#A7A7A7"
                        />
                      );
                    }}
                    dropdownIconPosition={"right"}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  /> */}
                </View>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.bigInputContainerName,
                  {
                    borderColor: firstName != "" ? "#F7941D" : "#F1F2F2",
                  },
                ]}
              >
                <View style={styles.inputContainerName}>
                  <Text style={styles.textContainer}>Prénom</Text>
                  <TextInput
                    style={styles.profiletextInputEmail}
                    placeholder="Prénom"
                    value={firstName}
                    onChangeText={(text) => setFirstName(text)}
                    placeholderTextColor="gray"
                  />
                </View>
              </View>
              <View
                style={[
                  styles.bigInputContainerName,
                  {
                    borderColor: lastName != "" ? "#F7941D" : "#F1F2F2",
                  },
                ]}
              >
                <View style={styles.inputContainerName}>
                  <Text style={styles.textContainer}>Nom</Text>
                  <TextInput
                    style={styles.profiletextInputEmail}
                    placeholder="Nom"
                    value={lastName}
                    onChangeText={(text) => setLastName(text)}
                    placeholderTextColor="gray"
                  />
                </View>
              </View>
            </View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: email != "" ? "#F7941D" : "#F1F2F2",
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>Adresse email</Text>
                <TextInput
                  style={styles.profiletextInputEmail}
                  placeholder="Adresse email"
                  value={email}
                  onChangeText={(text) => setEmail(text.toLowerCase())}
                  placeholderTextColor="gray"
                />
              </View>
            </View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: password != "" ? "#F7941D" : "#F1F2F2",
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>Mot de passe</Text>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    style={styles.profiletextInput}
                    placeholder="Mot de passe"
                    value={password}
                    secureTextEntry={secureTextEntryOne}
                    onChangeText={(text) => setPassword(text)}
                    placeholderTextColor="gray"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextEntryOne(!secureTextEntryOne)}
                  >
                    {secureTextEntryOne ? (
                      <Icon.Eye width={20} height={20} stroke="#A7A7A7" />
                    ) : (
                      <Icon.EyeOff width={20} height={20} stroke="#A7A7A7" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: confirmPassword != "" ? "#F7941D" : "#F1F2F2",
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>
                  Confirmer le mot de passe
                </Text>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    style={styles.profiletextInput}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    secureTextEntry={secureTextEntryTwo}
                    onChangeText={(text) => setConfirmPassword(text)}
                    placeholderTextColor="gray"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextEntryTwo(!secureTextEntryTwo)}
                  >
                    {secureTextEntryTwo ? (
                      <Icon.Eye width={20} height={20} stroke="#A7A7A7" />
                    ) : (
                      <Icon.EyeOff width={20} height={20} stroke="#A7A7A7" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: bio != "" ? "#F7941D" : "#F1F2F2",
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>Bio</Text>
                <TextInput
                  style={styles.profiletextInputBio}
                  placeholder="Entrez un texte à utiliser pour votre bio"
                  value={bio}
                  multiline={true}
                  maxLength={maxBioChar}
                  onChangeText={(text) => {
                    setBio(text);
                    setBioCharCount(text.length);
                  }}
                  placeholderTextColor="gray"
                />
                <Text
                  style={{
                    position: "absolute",
                    bottom: -20,
                    right: 0,
                    alignSelf: "flex-end",
                    fontWeight: "bold",
                    color: bioCharCount == maxBioChar ? "#E94E1B" : "#F7941D",
                  }}
                >
                  {bioCharCount}/{maxBioChar}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={handleRegister}>
            <Text style={styles.continueBtnText}>S'inscrire</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <View style={styles.footer}>
          <Text style={styles.newText}>Déjà sur TalCS? </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.registerBtn}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <Modal onBackdropPress={toggleModal} isVisible={modalVisibility}>
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
                onPress={goToCamerapage}
                activeOpacity={0.75}
                style={styles.modalButtonContainer}
              >
                <Text style={styles.modalButtonText}>Prendre une photo</Text>
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
                onPress={deleteProfilePicture}
                activeOpacity={0.75}
                style={styles.modalButtonContainer}
              >
                <Text style={styles.modalButtonText}>Supprimer la photo</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 10 }}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.modalHideButton}
                onPress={() => setModalVisibility(!modalVisibility)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  credentials: {
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
  },
  bigInputContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F2",
    borderWidth: 1,
    height: 60,
    marginTop: 10,
    marginBottom: 10,
    marginEnd: 20,
    marginStart: 20,
    borderRadius: 10,
  },
  bigInputContainerName: {
    width: "42.5%",
    flexDirection: "row",
    backgroundColor: "#F1F2F2",
    borderWidth: 1,
    height: 60,
    margin: 10,
    borderRadius: 10,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  inputContainerName: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  profiletextInput: {
    width: "80%",
    marginStart: 15,
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  profiletextInputBio: {
    width: "80%",
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  profiletextInputEmail: {
    width: "100%",
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  textContainer: {
    fontSize: 14,
    marginTop: 5,
    color: "#A7A7A7",
  },
  continueBtn: {
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#F7941D",
  },
  continueBtnText: {
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
    textAlign: "center",
    color: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newText: {
    color: "#0C0C0C",
    fontSize: 14,
  },
  registerBtn: {
    color: "#F7941D",
    fontWeight: "300",
    fontSize: 14,
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
  dropdown1BtnStyle: {
    width: "45%",
    height: 40,
    marginTop: 20,
    marginStart: 10,
    marginEnd: 10,
    backgroundColor: "#F1F2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F2F2",
  },
  dropdown1BtnTxtStyle: {
    color: "#A7A7A7",
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#F1F2F2",
  },
  dropdown1RowStyle: {
    backgroundColor: "#F1F2F2",
    borderBottomColor: "#A7A7A7",
  },
  dropdown1RowTxtStyle: {
    color: "#0C0C0C",
  },
});

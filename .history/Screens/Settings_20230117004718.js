import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { React, useState, useContext } from "react";
import Modal from "react-native-modal";
import * as Icon from "react-native-feather";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../AuthProvider";

const Settings = ({ navigation }) => {
  const versionNumber = 1.0;

  const { setIsLoggedIn } = useContext(AuthContext);

  const [modalVisibility, setModalVisibility] = useState(false);

  const toggleModal = () => {
    setModalVisibility(!modalVisibility);
  };

  const signOff = async () => {
    signOut(auth);
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@userData");
    setIsLoggedIn(false);
  };

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
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Icon.ChevronLeft
            style={{ marginStart: 10 }}
            width={25}
            height={25}
            stroke="#F7941D"
          />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Paramètres</Text>
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
        <View style={styles.credentials}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.buttonContainer}>
              <Icon.User
                style={styles.icon}
                width={25}
                height={25}
                stroke="#000000"
              />
              <Text style={styles.buttonText}>Paramètres liés au compte</Text>
            </TouchableOpacity>
            <View style={styles.separator}></View>
            <TouchableOpacity style={styles.buttonContainer}>
              <Icon.Bell
                style={styles.icon}
                width={25}
                height={25}
                stroke="#000000"
              />
              <Text style={styles.buttonText}>Notifications</Text>
            </TouchableOpacity>
            <View style={styles.separator}></View>
            <TouchableOpacity style={styles.buttonContainer}>
              <Icon.Shield
                style={styles.icon}
                width={25}
                height={25}
                stroke="#000000"
              />
              <Text style={styles.buttonText}>Confidentialité et sécurité</Text>
            </TouchableOpacity>
            <View style={styles.separator}></View>
            <TouchableOpacity style={styles.buttonContainer}>
              <Icon.HelpCircle
                style={styles.icon}
                width={20}
                height={20}
                stroke="#000000"
              />
              <Text style={styles.buttonText}>A propos et aide</Text>
            </TouchableOpacity>
            <View style={styles.separator}></View>
            <TouchableOpacity style={styles.buttonContainer} onPress={signOff}>
              <Icon.Power
                style={styles.icon}
                width={25}
                height={25}
                stroke="#000000"
              />
              <Text style={styles.buttonText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text style={styles.bottomTitle}>TalCS</Text>
            <Text style={styles.bottomCopyright}>
              Ⓒ2023 Studio JIATA - Version {versionNumber + ".0"}
            </Text>
          </View>
        </View>
        {/* <Modal onBackdropPress={toggleModal} isVisible={modalVisibility}>
          <View
            style={{
              width: "100%",
              position: "absolute",
              top: "37.5%",
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
              <View activeOpacity={0.75} style={styles.modalButtonContainer}>
                <Text style={styles.modalButtonText}>
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={toggleModal}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainerAction}
                >
                  <Text style={styles.modalButtonTextNo}>Non</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={signOff}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainerAction}
                >
                  <Text style={styles.modalButtonTextYes}>Oui</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  credentials: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  buttonText: {
    fontSize: 16,
  },
  separator: {
    borderColor: "#000000",
    borderWidth: 0.5,
    marginStart: 10,
    marginEnd: 10,
  },
  icon: {
    marginStart: 10,
    marginEnd: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  bottomTitle: {
    fontSize: 20,
    color: "#A7A7A7",
    fontWeight: "700",
  },
  bottomCopyright: {
    color: "#A7A7A7",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    height: 100,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalButtonContainerAction: {
    width: "50%",
    borderTopColor: "#000000",
    borderTopWidth: 0.5,
    backgroundColor: "white",
    padding: 20,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#0C0C0C",
    textAlign: "center",
  },
  modalButtonTextYes: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalButtonTextNo: {
    fontSize: 16,
    color: "#0C0C0C",
    textAlign: "center",
    fontWeight: "bold",
  },
});

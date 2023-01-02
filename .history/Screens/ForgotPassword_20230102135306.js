import {
  Image,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const sendRecoverEmail = () => {
    //console.log(auth);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        navigation.goBack();
        Alert.alert(
          "Erreur",
          "Email de réinitialisation de mot de passe envoyé, vérifiez votre courrier (indésirable également) !",
          [
            {
              text: "OK",
              style: "default",
            },
          ]
        );
      })
      .catch((error) => {
        console.log(error.message);
        Alert.alert("Erreur", "Vérifiez l'adresse email saisie !", [
          {
            text: "OK",
            style: "default",
          },
        ]);
      });
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon.ChevronLeft
            style={{ marginStart: 10 }}
            width={25}
            height={25}
            stroke="#F7941D"
          />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          Mot de passe oublié
        </Text>
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
        <KeyboardAvoidingView behavior="position" style={styles.credentials}>
          <Image style={styles.image} source={require("../assets/TalCS.png")} />
          <Text style={styles.forgotText}>
            Entrez l'adresse email associée à votre compte TalCS, nous vous
            enverrons un lien de réinitialisation de votre mot de passe.
          </Text>
          <View
            style={[
              styles.bigInputContainer,
              {
                borderColor: email != "" ? "#F7941D" : "",
                borderWidth: email != "" ? 1 : 0,
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.textContainer}>Adresse email</Text>
              <TextInput
                style={styles.profiletextInput}
                placeholder="Entrez votre adresse email"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                placeholderTextColor="gray"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={sendRecoverEmail}>
            <Text style={styles.submitBtnText}>Confirmer</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  credentials: {
    flex: 1,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 50,
  },
  forgotText: {
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 50,
    textAlign: "justify",
  },
  bigInputContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F2",
    height: 60,
    marginTop: 10,
    marginBottom: 150,
    marginEnd: 20,
    marginStart: 20,
    borderRadius: 10,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  profiletextInput: {
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
  submitBtn: {
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#F7941D",
  },
  submitBtnText: {
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
    textAlign: "center",
    color: "white",
  },
});

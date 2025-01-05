import * as React from "react";

import { Camera, CameraPermissionStatus } from "react-native-vision-camera";
import {
  Alert,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ICON_SIZE = 26;
export default function PermissionScreen() {
  const router = useRouter();

  const [CameraPermissionStatus, setCameraPermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined");

  //for mic
  const [mircophonePermissionStatus, setMicrophonePermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined");

  const requestCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permission);
  };

  const handleContinue = () => {
    if (CameraPermissionStatus === "granted") {
      router.replace("/");
    } else {
      Alert.alert("Please go settings and enable permission");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Permissions" }} />
      <ThemedView style={styles.container}>
        <View style={styles.spacer} />

        <ThemedText type="subtitle" style={styles.subtites}>
          Needs access to few permission to order to work properly
        </ThemedText>
        <View style={styles.row}>
          <Ionicons
            name="lock-closed-outline"
            size={ICON_SIZE}
            color={"orange"}
          />
          <ThemedText style={styles.footenote}> Required</ThemedText>
        </View>

        <View style={styles.spacer} />

        <View
          style={StyleSheet.compose(styles.row, styles.permissionContainer)}
        >
          <Ionicons name="camera-outline" size={ICON_SIZE} color={"gray"} />
          <View style={styles.permissionText}>
            <ThemedText type="subtitle">Camera</ThemedText>
            <ThemedText> Used for taking photos and videos</ThemedText>
          </View>
          <Switch
            trackColor={{ true: "orange" }}
            value={CameraPermissionStatus === "granted"}
            onChange={requestCameraPermission}
          >
            {" "}
          </Switch>
        </View>

        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <View style={styles.spacer} />

        <TouchableOpacity
          onPress={handleContinue}
          style={StyleSheet.compose(styles.row, styles.continueButton)}
        >
          <Ionicons
            name="arrow-forward-outline"
            color="white"
            size={ICON_SIZE}
          />
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtites: {
    textAlign: "center",
  },
  footenote: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spacer: {
    marginVertical: 8,
  },
  permissionContainer: {
    backgroundColor: "#ffffff20",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
  },
  permissionText: {
    marginLeft: 10,
    flexShrink: 1,
  },
  continueButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 50,
    alignSelf: "center",
  },
});

import { runOnJS } from "react-native-reanimated";
import * as React from "react";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";

import { Redirect, useRouter } from "expo-router";
import CameraButton from "@/components/CameraButton";
import { ClipOp, Skia, TileMode } from "@shopify/react-native-skia";
import { useFaceDetector } from "react-native-vision-camera-face-detector";

export default function App() {
  const { hasPermission } = useCameraPermission();
  //for mircophone
  const microphonePermission = Camera.getMicrophonePermissionStatus();

  const redirectToPermission =
    !hasPermission || microphonePermission === "not-determined";
  const router = useRouter();

  const device = useCameraDevice("front");

  //   if (redirectToPermission) {
  //     return <Redirect href={"/permission"}></Redirect>;
  //   }

  //frame processing
  const { detectFaces } = useFaceDetector({
    performanceMode: "fast",
    contourMode: "none",
    landmarkMode: "none",
    classificationMode: "none",
  });

  const blurRadius = 50;
  const blurFilter = Skia.ImageFilter.MakeBlur(
    blurRadius,
    blurRadius,
    TileMode.Decal,
    null
  );

  const paint = Skia.Paint();
  paint.setImageFilter(blurFilter);

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    "worklet";
    frame.render();


    const faces = detectFaces(frame);

    for (const face of faces) {
        console.log('Detected faces:', faces);

      const path = Skia.Path.Make();
      
         
     
      const rect = Skia.XYWHRect(
        face.bounds.y,
        (face.bounds.width + 500) - face.bounds.x - (face.bounds.width),
    

        face.bounds.height,
        face.bounds.width,
      );
      path.addOval(rect);

      frame.save();
      frame.clipPath(path, ClipOp.Intersect, true);
      frame.render(paint);
      frame.restore();
    }
  }, []);

  if (!device) {
    return <ThemedText> No device connected</ThemedText>;
  }
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 3, borderRadius: 10, overflow: "hidden" }}>
          <Camera
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            frameProcessor={frameProcessor}
          />
        </View>

        <View style={{ flex: 1 }}>
          {/* Top ssections*/}
          <View style={{ flex: 0.7 }}>
            <ThemedText> Max FPS: {device.formats[0].maxFps}</ThemedText>
            <ThemedText>
              Width: {device.formats[0].photoWidth} Height:{" "}
              {device.formats[0].photoHeight}
            </ThemedText>
            <ThemedText>Camera: {device.name}</ThemedText>
          </View>

          {/* bttom ssections*/}
          <View style={{ flex: 0.7 }}>
            <CameraButton
              iconName="camera-reverse-outline"
              onPress={() => console.log("Button pressed")}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
  },
});

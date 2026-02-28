import { runOnJS } from "react-native-reanimated";
import * as React from "react";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
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
import { ClipOp, Skia, TileMode, PaintStyle } from "@shopify/react-native-skia";
import { useFaceDetector } from "react-native-vision-camera-face-detector";
import { useSharedValue } from "react-native-reanimated";

type FilterType = "none" | "blur" | "sunglasses" | "clown" | "devil" | "mask";

export default function App() {
  const { hasPermission } = useCameraPermission();
  const microphonePermission = Camera.getMicrophonePermissionStatus();

  const redirectToPermission =
    !hasPermission || microphonePermission === "not-determined";
  const router = useRouter();

  const device = useCameraDevice("front");
  const [activeFilter, setActiveFilter] = useState<FilterType>("blur");

  // Shared value so the frame processor can read the current filter
  const currentFilter = useSharedValue<FilterType>("blur");

  const onFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    currentFilter.value = filter;
  }, []);

  // Face detection setup
  const { detectFaces } = useFaceDetector({
    performanceMode: "fast",
    contourMode: "none",
    landmarkMode: "all",
    classificationMode: "all",
  });

  // Blur filter paint
  const blurRadius = 50;
  const blurFilter = Skia.ImageFilter.MakeBlur(
    blurRadius,
    blurRadius,
    TileMode.Decal,
    null,
  );
  const blurPaint = Skia.Paint();
  blurPaint.setImageFilter(blurFilter);

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    "worklet";
    frame.render();

    const faces = detectFaces(frame);
    const filter = currentFilter.value;

    for (const face of faces) {
      const faceX = face.bounds.y;
      const faceY = face.bounds.width + 500 - face.bounds.x - face.bounds.width;
      const faceW = face.bounds.height;
      const faceH = face.bounds.width;

      if (filter === "none") {
        // No filter - do nothing
        continue;
      }

      if (filter === "blur") {
        // Blur face - existing functionality
        const path = Skia.Path.Make();
        const rect = Skia.XYWHRect(faceX, faceY, faceW, faceH);
        path.addOval(rect);

        frame.save();
        frame.clipPath(path, ClipOp.Intersect, true);
        frame.render(blurPaint);
        frame.restore();
      }

      if (filter === "sunglasses") {
        // Draw sunglasses over the eyes area
        const eyeY = faceY + faceH * 0.3;
        const eyeW = faceW * 0.35;
        const eyeH = faceH * 0.18;
        const bridgeY = eyeY + eyeH * 0.3;

        const glassPaint = Skia.Paint();
        glassPaint.setColor(Skia.Color("#1a1a1a"));

        const framePaint = Skia.Paint();
        framePaint.setColor(Skia.Color("#333333"));
        framePaint.setStyle(PaintStyle.Stroke);
        framePaint.setStrokeWidth(4);

        // Left lens
        const leftLens = Skia.RRectXY(
          Skia.XYWHRect(faceX + faceW * 0.08, eyeY, eyeW, eyeH),
          10,
          10,
        );
        frame.drawRRect(leftLens, glassPaint);
        frame.drawRRect(leftLens, framePaint);

        // Right lens
        const rightLens = Skia.RRectXY(
          Skia.XYWHRect(faceX + faceW * 0.57, eyeY, eyeW, eyeH),
          10,
          10,
        );
        frame.drawRRect(rightLens, glassPaint);
        frame.drawRRect(rightLens, framePaint);

        // Bridge between lenses
        const bridgePaint = Skia.Paint();
        bridgePaint.setColor(Skia.Color("#333333"));
        bridgePaint.setStrokeWidth(4);
        bridgePaint.setStyle(PaintStyle.Stroke);

        const bridgePath = Skia.Path.Make();
        bridgePath.moveTo(faceX + faceW * 0.08 + eyeW, bridgeY);
        bridgePath.lineTo(faceX + faceW * 0.57, bridgeY);
        frame.drawPath(bridgePath, bridgePaint);

        // Temple arms
        const leftArm = Skia.Path.Make();
        leftArm.moveTo(faceX + faceW * 0.08, bridgeY);
        leftArm.lineTo(faceX - faceW * 0.05, bridgeY - faceH * 0.02);
        frame.drawPath(leftArm, bridgePaint);

        const rightArm = Skia.Path.Make();
        rightArm.moveTo(faceX + faceW * 0.57 + eyeW, bridgeY);
        rightArm.lineTo(faceX + faceW * 1.05, bridgeY - faceH * 0.02);
        frame.drawPath(rightArm, bridgePaint);
      }

      if (filter === "clown") {
        // Red clown nose
        const nosePaint = Skia.Paint();
        nosePaint.setColor(Skia.Color("#FF0000"));

        const noseX = faceX + faceW * 0.5;
        const noseY = faceY + faceH * 0.55;
        const noseRadius = faceW * 0.1;
        frame.drawCircle(noseX, noseY, noseRadius, nosePaint);

        // Nose highlight
        const highlightPaint = Skia.Paint();
        highlightPaint.setColor(Skia.Color("#FF6666"));
        frame.drawCircle(
          noseX - noseRadius * 0.3,
          noseY - noseRadius * 0.3,
          noseRadius * 0.35,
          highlightPaint,
        );

        // Big smile
        const smilePaint = Skia.Paint();
        smilePaint.setColor(Skia.Color("#FF0000"));
        smilePaint.setStyle(PaintStyle.Stroke);
        smilePaint.setStrokeWidth(6);

        const smilePath = Skia.Path.Make();
        const smileY = faceY + faceH * 0.72;
        const smileW = faceW * 0.5;
        smilePath.moveTo(faceX + faceW * 0.25, smileY);
        smilePath.quadTo(
          faceX + faceW * 0.5,
          smileY + faceH * 0.18,
          faceX + faceW * 0.75,
          smileY,
        );
        frame.drawPath(smilePath, smilePaint);

        // White face circles on cheeks
        const cheekPaint = Skia.Paint();
        cheekPaint.setColor(Skia.Color("#FF666680"));
        frame.drawCircle(
          faceX + faceW * 0.2,
          faceY + faceH * 0.55,
          faceW * 0.08,
          cheekPaint,
        );
        frame.drawCircle(
          faceX + faceW * 0.8,
          faceY + faceH * 0.55,
          faceW * 0.08,
          cheekPaint,
        );
      }

      if (filter === "devil") {
        // Devil horns
        const hornPaint = Skia.Paint();
        hornPaint.setColor(Skia.Color("#CC0000"));

        // Left horn
        const leftHorn = Skia.Path.Make();
        leftHorn.moveTo(faceX + faceW * 0.2, faceY + faceH * 0.05);
        leftHorn.lineTo(faceX + faceW * 0.1, faceY - faceH * 0.25);
        leftHorn.lineTo(faceX + faceW * 0.35, faceY + faceH * 0.05);
        leftHorn.close();
        frame.drawPath(leftHorn, hornPaint);

        // Right horn
        const rightHorn = Skia.Path.Make();
        rightHorn.moveTo(faceX + faceW * 0.65, faceY + faceH * 0.05);
        rightHorn.lineTo(faceX + faceW * 0.9, faceY - faceH * 0.25);
        rightHorn.lineTo(faceX + faceW * 0.8, faceY + faceH * 0.05);
        rightHorn.close();
        frame.drawPath(rightHorn, hornPaint);

        // Horn highlights
        const highlightPaint = Skia.Paint();
        highlightPaint.setColor(Skia.Color("#FF3333"));

        const leftHighlight = Skia.Path.Make();
        leftHighlight.moveTo(faceX + faceW * 0.22, faceY + faceH * 0.05);
        leftHighlight.lineTo(faceX + faceW * 0.13, faceY - faceH * 0.18);
        leftHighlight.lineTo(faceX + faceW * 0.28, faceY + faceH * 0.05);
        leftHighlight.close();
        frame.drawPath(leftHighlight, highlightPaint);

        const rightHighlight = Skia.Path.Make();
        rightHighlight.moveTo(faceX + faceW * 0.72, faceY + faceH * 0.05);
        rightHighlight.lineTo(faceX + faceW * 0.87, faceY - faceH * 0.18);
        rightHighlight.lineTo(faceX + faceW * 0.78, faceY + faceH * 0.05);
        rightHighlight.close();
        frame.drawPath(rightHighlight, highlightPaint);

        // Evil eyebrows
        const browPaint = Skia.Paint();
        browPaint.setColor(Skia.Color("#CC0000"));
        browPaint.setStyle(PaintStyle.Stroke);
        browPaint.setStrokeWidth(5);

        const leftBrow = Skia.Path.Make();
        leftBrow.moveTo(faceX + faceW * 0.1, faceY + faceH * 0.32);
        leftBrow.lineTo(faceX + faceW * 0.4, faceY + faceH * 0.22);
        frame.drawPath(leftBrow, browPaint);

        const rightBrow = Skia.Path.Make();
        rightBrow.moveTo(faceX + faceW * 0.6, faceY + faceH * 0.22);
        rightBrow.lineTo(faceX + faceW * 0.9, faceY + faceH * 0.32);
        frame.drawPath(rightBrow, browPaint);
      }

      if (filter === "mask") {
        // Masquerade mask over eyes
        const maskPaint = Skia.Paint();
        maskPaint.setColor(Skia.Color("#4B0082"));

        const maskPath = Skia.Path.Make();
        const maskY = faceY + faceH * 0.25;
        const maskH = faceH * 0.25;

        // Left eye mask shape
        maskPath.moveTo(faceX + faceW * 0.05, maskY + maskH * 0.5);
        maskPath.quadTo(
          faceX + faceW * 0.15,
          maskY - maskH * 0.2,
          faceX + faceW * 0.3,
          maskY + maskH * 0.3,
        );
        maskPath.quadTo(
          faceX + faceW * 0.25,
          maskY + maskH * 1.1,
          faceX + faceW * 0.05,
          maskY + maskH * 0.5,
        );

        // Bridge
        maskPath.moveTo(faceX + faceW * 0.3, maskY + maskH * 0.3);
        maskPath.quadTo(
          faceX + faceW * 0.5,
          maskY,
          faceX + faceW * 0.7,
          maskY + maskH * 0.3,
        );

        // Right eye mask shape
        maskPath.moveTo(faceX + faceW * 0.95, maskY + maskH * 0.5);
        maskPath.quadTo(
          faceX + faceW * 0.85,
          maskY - maskH * 0.2,
          faceX + faceW * 0.7,
          maskY + maskH * 0.3,
        );
        maskPath.quadTo(
          faceX + faceW * 0.75,
          maskY + maskH * 1.1,
          faceX + faceW * 0.95,
          maskY + maskH * 0.5,
        );

        frame.drawPath(maskPath, maskPaint);

        // Gold border
        const borderPaint = Skia.Paint();
        borderPaint.setColor(Skia.Color("#FFD700"));
        borderPaint.setStyle(PaintStyle.Stroke);
        borderPaint.setStrokeWidth(3);
        frame.drawPath(maskPath, borderPaint);

        // Eye cutouts (dark)
        const cutoutPaint = Skia.Paint();
        cutoutPaint.setColor(Skia.Color("#000000"));

        const leftEye = Skia.XYWHRect(
          faceX + faceW * 0.12,
          maskY + maskH * 0.2,
          faceW * 0.18,
          maskH * 0.5,
        );
        const rightEye = Skia.XYWHRect(
          faceX + faceW * 0.7,
          maskY + maskH * 0.2,
          faceW * 0.18,
          maskH * 0.5,
        );

        const leftCutout = Skia.Path.Make();
        leftCutout.addOval(leftEye);
        frame.drawPath(leftCutout, cutoutPaint);

        const rightCutout = Skia.Path.Make();
        rightCutout.addOval(rightEye);
        frame.drawPath(rightCutout, cutoutPaint);
      }
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
          {/* Camera info */}
          <View
            style={{
              flex: 0.4,
              justifyContent: "center",
              paddingHorizontal: 10,
            }}
          >
            <ThemedText style={{ fontSize: 12 }}>
              Camera: {device.name}
            </ThemedText>
            <ThemedText style={{ fontSize: 12 }}>
              Filter:{" "}
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            </ThemedText>
          </View>

          {/* Filter selection */}
          <View style={{ flex: 0.5, justifyContent: "center" }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBar}
            >
              <CameraButton
                title="None"
                iconName="close-circle-outline"
                onPress={() => onFilterChange("none")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "none" && styles.activeFilterButton,
                ]}
              />
              <CameraButton
                title="Blur"
                iconName="eye-off-outline"
                onPress={() => onFilterChange("blur")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "blur" && styles.activeFilterButton,
                ]}
              />
              <CameraButton
                title="Shades"
                iconName="glasses-outline"
                onPress={() => onFilterChange("sunglasses")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "sunglasses" && styles.activeFilterButton,
                ]}
              />
              <CameraButton
                title="Clown"
                iconName="happy-outline"
                onPress={() => onFilterChange("clown")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "clown" && styles.activeFilterButton,
                ]}
              />
              <CameraButton
                title="Devil"
                iconName="flame-outline"
                onPress={() => onFilterChange("devil")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "devil" && styles.activeFilterButton,
                ]}
              />
              <CameraButton
                title="Mask"
                iconName="eye-outline"
                onPress={() => onFilterChange("mask")}
                containerStyle={[
                  styles.filterButton,
                  activeFilter === "mask" && styles.activeFilterButton,
                ]}
              />
            </ScrollView>
          </View>

          {/* Camera controls */}
          <View
            style={{
              flex: 0.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CameraButton
              iconName="camera-reverse-outline"
              onPress={() => console.log("Button pressed")}
              iconSize={28}
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
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilterButton: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
});

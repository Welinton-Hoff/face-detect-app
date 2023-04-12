import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import * as FaceDetector from "expo-face-detector";
import { ImageSourcePropType, View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";

import neutralFace from "../../assets/neutral-face.png";
import winkingFace from "../../assets/winking-face.png";
import grinningFace from "../../assets/grinning-squinting-face.png";

import { styles } from "./styles";

export function Home() {
  const [faceDetected, updateFaceDetected] = useState(false);
  const [permission, requestPermissions] = Camera.useCameraPermissions();
  const [emoji, updateEmoji] = useState<ImageSourcePropType>(neutralFace);

  const faceValues = useSharedValue({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: 1,
    position: "absolute",
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }));

  useEffect(() => {
    requestPermissions();
  }, []);

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      updateFaceDetected(true);

      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };

      switch (true) {
        case face.smilingProbability > 0.5:
          return updateEmoji(grinningFace);
        case face.leftEyeOpenProbability > 0.5 &&
          face.rightEyeOpenProbability < 0.5:
          return updateEmoji(winkingFace);
        default:
          return updateEmoji(neutralFace);
      }
    } else {
      updateFaceDetected(false);
    }
  }

  if (!permission) {
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}

      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          tracking: true,
          minDetectionInterval: 100,
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
        }}
      />
    </View>
  );
}

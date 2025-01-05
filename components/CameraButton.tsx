import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle, Text } from "react-native";


interface CameraButtonProps {
    onPress: () => void;
    title?: string;
    iconName?: ComponentProps<typeof Ionicons>["name"];
    containerStyle?: StyleProp<ViewStyle>;
    iconSize?: number;
}
export default function CameraButton({

    onPress,iconName,title,containerStyle,iconSize,
    
}: CameraButtonProps){
    return (
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.container,
            {
              backgroundColor: Colors.dark.background,
              borderRadius: title ? 6 : 40,
              alignSelf: 'flex-start',
            },
            containerStyle,
          ]}
        >
          {iconName && (
            <Ionicons name={iconName} size={iconSize} color="white" />
          )}
          {title && (
            <Text 
              style={{
                fontSize: 14, 
                fontWeight: '600', 
                color: 'white',
              }}
            >
              {title}
            </Text>
          )}
        </TouchableOpacity>
      );
}

const styles = StyleSheet.create({
    container: {
        padding: 7,
        borderRadius: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    }
},
)
/**
 * Four-digit PIN input for parent dashboard access.
 */
import { useRef } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

import { colors } from "@/constants/colors";

const PIN_LENGTH = 4;

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function PinInput({ value, onChange }: Props) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length: PIN_LENGTH }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, digit: string) {
    const sanitized = digit.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = sanitized;
    const joined = next.join("").slice(0, PIN_LENGTH);
    onChange(joined);

    if (sanitized && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) {
    if (event.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <Pressable
          key={index}
          onPress={() => inputRefs.current[index]?.focus()}
          style={styles.box}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => updateDigit(index, text)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
            style={styles.input}
            textAlign="center"
            selectTextOnFocus
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: 76,
    height: 85,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 0,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 24,
  },
});

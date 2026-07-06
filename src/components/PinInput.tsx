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
import { shadows } from "@/styles/shadows";

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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 72,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.soft,
  },
  input: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 24,
  },
});

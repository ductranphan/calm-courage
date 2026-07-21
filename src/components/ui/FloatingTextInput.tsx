/**
 * Floating label input.
 *
 * Used for form fields that show a normal placeholder first,
 * then move the label above the border when focused or filled.
 */

import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = TextInputProps & {
  label: string;
};

export default function FloatingTextInput({ label, value, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || Boolean(value);

  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        value={value}
        placeholder={isActive ? "" : props.placeholder ?? label}
        placeholderTextColor={colors.muted}
        cursorColor={colors.primary}
        selectionColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[styles.input, props.style]}
      />

      {isActive ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: x(362),
    height: y(72),
    position: "relative",
  },

  input: {
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
  },

  label: {
    position: "absolute",
    left: x(26),
    top: y(-18),
    minWidth: x(152),
    height: y(35),
    borderRadius: x(20),
    paddingHorizontal: x(10),
    backgroundColor: colors.white,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
    zIndex: 10,
  },
});
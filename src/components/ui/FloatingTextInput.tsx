/**
 * Floating label input.
<<<<<<< HEAD
 */
import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { x, y } from "@/utils/scaling";
import { colors } from "@/constants/colors";
=======
 *
 * Used for form fields that show a normal placeholder first,
 * then move the label above the border when focused or filled.
 */

import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40

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
<<<<<<< HEAD
        placeholder={isActive ? "" : label}
=======
        placeholder={isActive ? "" : props.placeholder ?? label}
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
        placeholderTextColor={colors.muted}
        cursorColor={colors.primary}
        selectionColor={colors.primary}
        onFocus={(event) => {
<<<<<<< HEAD
            setFocused(true);
            props.onFocus?.(event);
        }}
        onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
        }}
        style={styles.input}
        />

      {isActive ? (
        <Text style={styles.label}>
          {label}
        </Text>
      ) : null}
=======
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
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
    wrapper: {
    width: 362,
    height: 72,
    position: "relative",
    },

    input: {
=======
  wrapper: {
    width: x(362),
    height: y(72),
    position: "relative",
  },

  input: {
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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
<<<<<<< HEAD
    },

    label: {
    position: "absolute",
    left: x(26),
    top: y(-18),
    width: x(180),
=======
  },

  label: {
    position: "absolute",
    left: x(26),
    top: y(-18),
    minWidth: x(152),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    height: y(35),
    borderRadius: x(20),
    paddingHorizontal: x(10),
    backgroundColor: colors.white,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
<<<<<<< HEAD
    },
=======
    zIndex: 10,
  },
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
});
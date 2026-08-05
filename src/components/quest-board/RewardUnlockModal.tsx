/**
 * Reward unlock popup shown after completing a quest.
 *
 * This is a modal overlay, not a separate Expo Router page.
 */

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import StarExplorerHat from "../../../assets/images/reward-star-explorer-hat.svg";

const MODAL_BACKGROUND = "#DDEAEC";

type RewardUnlockModalProps = {
  visible: boolean;
  onClose: () => void;
  onClaimReward: () => void;
  onPrintCertificate: () => void;
};

export default function RewardUnlockModal({
  visible,
  onClose,
  onClaimReward,
  onPrintCertificate,
}: RewardUnlockModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close reward popup"
            hitSlop={10}
          >
            <View style={styles.closeIcon}>
              <View
                style={[
                  styles.closeLine,
                  styles.closeLineOne,
                ]}
              />

              <View
                style={[
                  styles.closeLine,
                  styles.closeLineTwo,
                ]}
              />
            </View>
          </Pressable>

          <Text style={styles.title}>
            Congratulations!
          </Text>

          <Text style={styles.description}>
            You have unlocked a new reward for
            completing your quest!
          </Text>

          <StarExplorerHat
            width={x(138)}
            height={x(138)}
            style={styles.rewardImage}
          />

          <View style={styles.rewardInformation}>
            <Text style={styles.rewardName}>
              Star Explorer Hat
            </Text>

            <Text style={styles.rewardType}>
              Avatar Item
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.claimButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={onClaimReward}
            accessibilityRole="button"
            accessibilityLabel="Claim Star Explorer Hat"
          >
            <Text style={styles.actionButtonText}>
              Claim Reward
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.certificateButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={onPrintCertificate}
            accessibilityRole="button"
            accessibilityLabel="Print certificate for parents"
          >
            <Text style={styles.actionButtonText}>
              Print Certificate for Parents
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    paddingHorizontal: x(20),
  },

  popup: {
    position: "relative",
    width: x(331),
    height: y(561),
    maxWidth: "100%",
    borderRadius: x(20),
    backgroundColor: MODAL_BACKGROUND,
  },

  closeButton: {
    position: "absolute",
    right: x(8),
    top: y(8),
    width: x(42),
    height: x(42),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  closeIcon: {
    position: "relative",
    width: x(25.06),
    height: x(25.06),
  },

  closeLine: {
    position: "absolute",
    left: x(9.5),
    top: 0,
    width: x(6),
    height: x(27),
    borderRadius: x(3),
    backgroundColor: "#000000",
  },

  closeLineOne: {
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  closeLineTwo: {
    transform: [
      {
        rotate: "-45deg",
      },
    ],
  },

  title: {
    position: "absolute",
    left: x(43),
    top: y(45),
    width: x(244),
    height: y(39),
    color: colors.primary,
    fontFamily: "OutfitBlack",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  description: {
    position: "absolute",
    left: x(22),
    top: y(98),
    width: x(286),
    minHeight: y(90),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(25),
    lineHeight: y(30),
    fontWeight: "400",
    textAlign: "center",
  },

  rewardImage: {
    position: "absolute",
    left: x(96.5),
    top: y(225),
  },

  rewardInformation: {
    position: "absolute",
    left: x(83),
    top: y(372),
    width: x(165),
    minHeight: y(40),
    alignItems: "center",
  },

  rewardName: {
    color: colors.primary,
    fontFamily: "Inter",
    fontSize: x(15),
    lineHeight: y(18),
    fontWeight: "700",
    textAlign: "center",
  },

  rewardType: {
    color: colors.primary,
    fontFamily: "Inter",
    fontSize: x(14),
    lineHeight: y(18),
    fontWeight: "400",
    textAlign: "center",
  },

  actionButton: {
    position: "absolute",
    left: x(67.5),
    width: x(196),
    height: y(36),
    borderRadius: x(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  claimButton: {
    top: y(430),
  },

  certificateButton: {
    top: y(482),
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontFamily: "LiterataBold",
    fontSize: x(12),
    lineHeight: y(16),
    textAlign: "center",
  },

  actionButtonPressed: {
    opacity: 0.75,
  },

  pressed: {
    opacity: 0.6,
  },
});
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import BadgeIcon from "../../../assets/icons/certificate-badge.svg";
import DiamondIcon from "../../../assets/icons/diamond.svg";
import StarIcon from "../../../assets/icons/star.svg";

const PRIMARY = "#2F448B";
const MODAL_BACKGROUND = "#DDEAEC";
const CANCEL_BACKGROUND = "#D9D9D9";
const ACTION_BACKGROUND = "#E8D6EC";

type UnlockConfirmationModalProps = {
  visible: boolean;
  gems: number;
  onCancel: () => void;
  onUnlock: () => void;
};

type ScenarioSuccessModalProps = {
  visible: boolean;
  stars?: number;
  gems?: number;
  onClaim: () => void;
};

export function UnlockConfirmationModal({
  visible,
  gems,
  onCancel,
  onUnlock,
}: UnlockConfirmationModalProps) {
  const canUnlock = gems >= 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.unlockTitle}>
            Unlock this quest
            {"\n"}
            for 1 Gem?
          </Text>

          <Text style={styles.currentGemsText}>
            You currently have {gems}{" "}
            {gems === 1 ? "Gem" : "Gems"}.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel unlock"
          >
            <Text style={styles.buttonText}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.unlockButton,

              !canUnlock &&
                styles.unlockButtonDisabled,

              pressed &&
                canUnlock &&
                styles.buttonPressed,
            ]}
            onPress={onUnlock}
            disabled={!canUnlock}
            accessibilityRole="button"
            accessibilityLabel="Unlock for 1 Gem"
            accessibilityState={{
              disabled: !canUnlock,
            }}
          >
            <Text style={styles.buttonText}>
              Unlock
            </Text>

            <DiamondIcon
              width={x(20)}
              height={x(20)}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ScenarioSuccessModal({
  visible,
  stars = 15,
  gems = 5,
  onClaim,
}: ScenarioSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClaim}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.successTitle}>
            You Earned
            {"\n"}
            a Badge!
          </Text>

          <View style={styles.successBadge}>
            <BadgeIcon
              width={x(49.23)}
              height={y(67.59)}
            />
          </View>

          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <StarIcon
                width={x(32)}
                height={x(32)}
              />

              <Text style={styles.rewardText}>
                {stars} Stars
              </Text>
            </View>

            <View style={styles.rewardItem}>
              <DiamondIcon
                width={x(35)}
                height={x(35)}
              />

              <Text style={styles.rewardText}>
                {gems} Gems
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.claimButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClaim}
            accessibilityRole="button"
            accessibilityLabel="Claim Reward"
          >
            <Text style={styles.claimButtonText}>
              Claim Reward
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
    position: "relative",
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },

  modalCard: {
    position: "absolute",

    left: x(36),
    top: y(255),

    width: x(331),
    height: y(417),

    borderRadius: x(20),

    backgroundColor: MODAL_BACKGROUND,
  },

  /*
   * UNLOCK MODAL
   */

  unlockTitle: {
    position: "absolute",

    left: x(45),
    top: y(78),

    width: x(242),
    height: y(76),

    color: PRIMARY,

    fontFamily: "OutfitBlack",
    fontSize: x(30),
    lineHeight: y(38),

    textAlign: "center",
    textAlignVertical: "center",

    includeFontPadding: false,
  },

  currentGemsText: {
    position: "absolute",

    left: x(23),
    top: y(208),

    width: x(286),
    height: y(25),

    color: PRIMARY,

    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),

    textAlign: "center",

    includeFontPadding: false,
  },

  cancelButton: {
    position: "absolute",

    left: x(40),
    top: y(287),

    width: x(117),
    height: y(52),

    borderRadius: x(20),

    backgroundColor: CANCEL_BACKGROUND,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,

    shadowOffset: {
      width: 0,
      height: y(4),
    },

    shadowOpacity: 0.25,
    shadowRadius: x(4),

    elevation: 5,
  },

  unlockButton: {
    position: "absolute",

    left: x(172),
    top: y(287),

    width: x(117),
    height: y(52),

    borderRadius: x(20),

    backgroundColor: ACTION_BACKGROUND,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    columnGap: x(5),

    shadowColor: colors.black,

    shadowOffset: {
      width: 0,
      height: y(4),
    },

    shadowOpacity: 0.25,
    shadowRadius: x(4),

    elevation: 5,
  },

  unlockButtonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: PRIMARY,

    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),

    textAlign: "center",

    includeFontPadding: false,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  /*
   * SUCCESS MODAL
   */

  successTitle: {
    position: "absolute",

    left: x(85),
    top: y(48),

    width: x(161),
    height: y(76),

    color: PRIMARY,

    fontFamily: "OutfitBlack",
    fontSize: x(30),
    lineHeight: y(38),

    textAlign: "center",
    textAlignVertical: "center",

    includeFontPadding: false,
  },

  successBadge: {
    position: "absolute",

    left: x(135),
    top: y(152),

    width: x(49.23),
    height: y(67.59),

    alignItems: "center",
    justifyContent: "center",
  },

  rewardRow: {
    position: "absolute",

    left: x(26),
    top: y(228),

    width: x(279),
    height: y(48),

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",
  },

  rewardItem: {
    minWidth: x(118),
    height: y(48),

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    columnGap: x(8),
  },

  rewardText: {
    color: PRIMARY,

    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),

    includeFontPadding: false,
  },

  claimButton: {
    position: "absolute",

    left: x(60),
    top: y(322),

    width: x(210),
    height: y(52),

    borderRadius: x(20),

    backgroundColor: ACTION_BACKGROUND,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.black,

    shadowOffset: {
      width: 0,
      height: y(4),
    },

    shadowOpacity: 0.25,
    shadowRadius: x(4),

    elevation: 5,
  },

  claimButtonText: {
    color: PRIMARY,

    fontFamily: "Outfit",
    fontSize: x(20),
    lineHeight: y(25),

    textAlign: "center",

    includeFontPadding: false,
  },
});
/**
 * Parent Help & Support screen.
 *
 * Provides searchable and filterable help articles.
 */

import {
  router,
  type Href,
} from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ParentBottomNav from "@/components/dashboard/ParentBottomNav";
import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import AudioOffIcon from "../../assets/icons/audio-off.svg";
import AudioOnIcon from "../../assets/icons/audio-on.svg";

const FIXED_FOOTER_HEIGHT = 105;
const FIXED_FOOTER_BOTTOM = 20;
const FOOTER_SCROLL_SPACE = 125;

type HelpCategory =
  | "all"
  | "subscription"
  | "account"
  | "child-safety";

type HelpArticle = {
  id: string;
  category: Exclude<HelpCategory, "all">;
  question: string;
  answer: string;
};

const CATEGORIES: {
  id: HelpCategory;
  label: string;
}[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "subscription",
    label: "Subscription",
  },
  {
    id: "account",
    label: "Account",
  },
  {
    id: "child-safety",
    label: "Child Safety",
  },
];

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "founding-member-subscription",
    category: "subscription",
    question:
      "How do I manage my Founding Member subscription?",
    answer:
      "You can manage your subscription in your app store. For our Founding Members, special price locking details are permanently active, as shown in previous billing history. Tap “Manage in App Store” within the Settings section.",
  },
  {
    id: "child-data-security",
    category: "child-safety",
    question: "Is my child’s data secure?",
    answer:
      "Your child’s profile and activity information are linked to your authenticated parent account. Please review the Privacy Policy for details about how information is collected, stored, protected, and deleted.",
  },
  {
    id: "multiple-children",
    category: "account",
    question: "How do I add multiple children?",
    answer:
      "Open the Children tab from the parent navigation, then tap “+ Add Another Child Profile.” Complete the child information and avatar steps to add the new profile.",
  },
];

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function ChevronRight() {
  return <View style={styles.chevronRight} />;
}

export default function HelpSupportScreen() {
  const [audioEnabled, setAudioEnabled] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<HelpCategory>("all");

  const [
    expandedArticleId,
    setExpandedArticleId,
  ] = useState<string | null>(
    "founding-member-subscription",
  );

  const filteredArticles = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return HELP_ARTICLES.filter((article) => {
      const categoryMatches =
        selectedCategory === "all" ||
        article.category === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        article.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.answer
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [searchQuery, selectedCategory]);

  function toggleArticle(articleId: string) {
    setExpandedArticleId((current) =>
      current === articleId
        ? null
        : articleId,
    );
  }

  function handleSwitchToChildMode() {
    router.replace(
      "/switch-to-child" as Href,
    );
  }

  function handleContactUs() {
    router.push("/contact-us" as Href);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerLayer}>
        <BackButton fallback="/settings" />

        <Pressable
          style={({ pressed }) => [
            styles.audioButton,
            pressed && styles.controlPressed,
          ]}
          onPress={() =>
            setAudioEnabled(
              (current) => !current,
            )
          }
          accessibilityRole="button"
          accessibilityLabel={
            audioEnabled
              ? "Turn audio off"
              : "Turn audio on"
          }
          accessibilityState={{
            selected: audioEnabled,
          }}
          hitSlop={8}
        >
          {audioEnabled ? (
            <AudioOnIcon
              width={x(35)}
              height={x(35)}
            />
          ) : (
            <AudioOffIcon
              width={x(35)}
              height={x(35)}
            />
          )}
        </Pressable>

        <Text style={styles.title}>
          Help &amp; Support
        </Text>

        <View style={styles.headerDivider} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchWrapper}>
          <SearchIcon />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search articles or questions..."
            placeholderTextColor="#7D7C7C"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel="Search help articles"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryRow
          }
          bounces={false}
          alwaysBounceHorizontal={false}
          overScrollMode="never"
        >
          {CATEGORIES.map((category) => {
            const selected =
              selectedCategory === category.id;

            return (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryChip,
                  selected &&
                    styles.categoryChipSelected,
                  pressed &&
                    styles.controlPressed,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    category.id,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Show ${category.label} help articles`}
                accessibilityState={{
                  selected,
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.articlesWrapper}>
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No matching help articles
              </Text>

              <Text style={styles.emptyText}>
                Try another search or category.
              </Text>
            </View>
          ) : (
            filteredArticles.map((article) => {
              const expanded =
                expandedArticleId ===
                article.id;

              return (
                <Pressable
                  key={article.id}
                  style={({ pressed }) => [
                    expanded
                      ? styles.expandedArticleCard
                      : styles.collapsedArticleCard,
                    pressed &&
                      styles.controlPressed,
                  ]}
                  onPress={() =>
                    toggleArticle(article.id)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    article.question
                  }
                  accessibilityState={{
                    expanded,
                  }}
                >
                  <Text
                    style={
                      styles.articleQuestion
                    }
                  >
                    {article.question}
                  </Text>

                  {expanded ? (
                    <Text
                      style={
                        styles.articleAnswer
                      }
                    >
                      {article.answer}
                    </Text>
                  ) : (
                    <View
                      style={
                        styles.articleChevronWrapper
                      }
                    >
                      <ChevronRight />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>
            Still need help? Send us a
            message
          </Text>

          <AppButton
            title="Contact Us"
            onPress={handleContactUs}
            style={styles.contactButton}
          />
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <Pressable
          style={({ pressed }) => [
            styles.switchToChildWrapper,
            pressed && styles.controlPressed,
          ]}
          onPress={handleSwitchToChildMode}
          accessibilityRole="button"
          accessibilityLabel="Switch to child mode"
        >
          <Text
            style={styles.switchToChildText}
          >
            Switch to Child Mode
          </Text>
        </Pressable>

        <View style={styles.bottomNavWrapper}>
          <ParentBottomNav
            activeTab="settings"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.background,
  },

  headerLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: y(210),
    backgroundColor: colors.background,
    zIndex: 20,
  },

  audioButton: {
    position: "absolute",
    left: x(347),
    top: y(48),
    width: x(35),
    height: x(35),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(38),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(30),
    lineHeight: y(38),
    textAlign: "center",
  },

  headerDivider: {
    position: "absolute",
    left: x(20),
    top: y(188),
    width: x(362),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingTop: y(215),
    paddingHorizontal: x(20),
    paddingBottom: y(
      FOOTER_SCROLL_SPACE,
    ),
    backgroundColor: colors.background,
  },

  searchWrapper: {
    width: x(362),
    height: y(50),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(100),
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    width: x(27),
    height: y(27),
    marginLeft: x(13),
    alignItems: "center",
    justifyContent: "center",
  },

  searchCircle: {
    position: "absolute",
    left: x(1),
    top: y(1),
    width: x(16),
    height: x(16),
    borderWidth: x(2),
    borderColor: colors.primary,
    borderRadius: x(8),
  },

  searchHandle: {
    position: "absolute",
    left: x(16),
    top: y(17),
    width: x(10),
    height: y(2),
    borderRadius: x(2),
    backgroundColor: colors.primary,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: x(14),
    paddingVertical: 0,
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(20),
  },

  categoryRow: {
    minWidth: x(362),
    paddingTop: y(10),
    paddingBottom: y(15),
    columnGap: x(12),
    alignItems: "center",
  },

  categoryChip: {
    minWidth: x(50),
    height: y(27),
    paddingHorizontal: x(14),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(100),
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryChipSelected: {
    backgroundColor: colors.primary,
  },

  categoryText: {
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(15),
    lineHeight: y(19),
    textAlign: "center",
  },

  categoryTextSelected: {
    color: colors.white,
  },

  articlesWrapper: {
    width: x(362),
    rowGap: y(15),
  },

  expandedArticleCard: {
    width: x(362),
    minHeight: y(278),
    paddingHorizontal: x(20),
    paddingTop: y(18),
    paddingBottom: y(20),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.background,
  },

  collapsedArticleCard: {
    width: x(362),
    minHeight: y(62),
    paddingLeft: x(20),
    paddingRight: x(54),
    paddingVertical: y(15),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.background,
    justifyContent: "center",

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 4,
  },

  articleQuestion: {
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(20),
    lineHeight: y(25),
  },

  articleAnswer: {
    marginTop: y(20),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
  },

  articleChevronWrapper: {
    position: "absolute",
    right: x(20),
    top: "50%",
    width: x(20),
    height: y(20),
    marginTop: y(-10),
    alignItems: "center",
    justifyContent: "center",
  },

  chevronRight: {
    width: x(11),
    height: x(11),
    borderTopWidth: x(2),
    borderRightWidth: x(2),
    borderColor: colors.primary,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  emptyCard: {
    width: x(362),
    minHeight: y(144),
    paddingHorizontal: x(24),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
  },

  emptyText: {
    marginTop: y(8),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  contactCard: {
    width: x(362),
    minHeight: y(144),
    marginTop: y(15),
    paddingHorizontal: x(20),
    paddingTop: y(16),
    paddingBottom: y(13),
    borderRadius: x(20),
    backgroundColor: "#DDEAEC",
    alignItems: "center",
  },

  contactTitle: {
    width: x(322),
    color: colors.primary,
    fontFamily: "OutfitBold",
    fontSize: x(20),
    lineHeight: y(25),
    textAlign: "center",
  },

  contactButton: {
    width: x(209),
    height: y(52),
    marginTop: y(17),
    borderRadius: x(20),

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  fixedFooter: {
    position: "absolute",
    left: x(20),
    bottom: y(FIXED_FOOTER_BOTTOM),
    width: x(362),
    height: y(FIXED_FOOTER_HEIGHT),
    backgroundColor: "transparent",
    zIndex: 50,
  },

  switchToChildWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    minWidth: x(226),
    height: y(28),
    justifyContent: "center",
  },

  switchToChildText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    top: y(33),
    width: x(362),
    height: y(72),
    borderRadius: x(50),
    backgroundColor: colors.background,
    overflow: "hidden",
    zIndex: 50,
    elevation: 12,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.12,
    shadowRadius: x(5),
  },

  controlPressed: {
    opacity: 0.65,
  },
});
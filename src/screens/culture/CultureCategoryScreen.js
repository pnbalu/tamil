import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows, cardOverlayGradientColors, screenGradientColors, accentBarGradientColors } from '../../theme';
import { radii } from '../../theme/radii';
import { getItemsByCategory } from '../../lib/cultureApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - spacing.screen * 2 - CARD_MARGIN * 2;
const CARD_HEIGHT = Math.min(320, SCREEN_HEIGHT * 0.6);
const BOTTOM_STRIP_HEIGHT = 76;

// Request small dimensions + quality so file size stays under 100KB
const IMG_OPTS = 'w=400&h=200&fit=crop&q=60';

/** Relevant images by category theme (fallback when item has no image_url). */
const ITEM_IMAGES_BY_THEME = {
  festivals: [
    `https://images.unsplash.com/photo-1605870445919-838d190e8e1b?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1567591400380-2f88c382c2a5?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?${IMG_OPTS}`,
  ],
  'food-drink': [
    `https://images.unsplash.com/photo-1589302168068-964664d93dc0?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1565557623262-b51c2513a641?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1596797038530-2c107229654b?${IMG_OPTS}`,
  ],
  'family-home': [
    `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?${IMG_OPTS}`,
  ],
  nature: [
    `https://images.unsplash.com/photo-1548013146-72479768bada?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?${IMG_OPTS}`,
  ],
  default: [
    `https://images.unsplash.com/photo-1567591400380-2f88c382c2a5?${IMG_OPTS}`,
    `https://images.unsplash.com/photo-1544551763-46a013bb70d5?${IMG_OPTS}`,
  ],
};

function getCategoryTheme(categoryName) {
  if (!categoryName) return 'default';
  const n = (categoryName || '').toLowerCase();
  if (n.includes('festival')) return 'festivals';
  if (n.includes('food') || n.includes('drink')) return 'food-drink';
  if (n.includes('family') || n.includes('home')) return 'family-home';
  if (n.includes('nature')) return 'nature';
  return 'default';
}

function getItemImageUrl(item, categoryName, index) {
  if (item?.image_url) return item.image_url;
  const theme = getCategoryTheme(categoryName);
  const list = ITEM_IMAGES_BY_THEME[theme] || ITEM_IMAGES_BY_THEME.default;
  const i = Math.abs((index || 0) % list.length);
  return list[i];
}

function AnimatedItemCard({ item, index, categoryName, onPress }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay: 60 + index * 60,
      useNativeDriver: true,
    }).start();
  }, [index, anim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const animatedStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
      { scale: scaleAnim },
    ],
  };

  return (
    <Animated.View style={[{ width: CARD_WIDTH, marginRight: CARD_MARGIN }, animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Image
          source={{ uri: getItemImageUrl(item, categoryName, index) }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardImageOverlay} />
        <View style={styles.bottomStrip}>
          <LinearGradient colors={cardOverlayGradientColors} style={StyleSheet.absoluteFill} />
          <View style={styles.bottomStripContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.name_en}</Text>
            {item.name_ta ? <Text style={styles.cardTa} numberOfLines={1}>{item.name_ta}</Text> : null}
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={22} color={colors.textOnPrimary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CultureCategoryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { categoryId, categoryName, categoryNameTa, level = 'beginner' } = route.params ?? {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    getItemsByCategory(categoryId, level).then(({ items: list, error: err }) => {
      setItems(list || []);
      setError(err || '');
      setLoading(false);
    });
  }, [categoryId, level]);

  const topMargin = Math.max(insets.top, spacing.lg);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs', { screen: 'Culture' });
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />
      {/* Static header – sub-category with Tamil, accent bar, and topic count */}
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <LinearGradient colors={accentBarGradientColors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerAccentBar} />
          <View style={styles.headerTitleBlock}>
            <Text style={styles.breadcrumb}>Culture</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{categoryName || 'Culture'}</Text>
            {categoryNameTa ? <Text style={styles.headerTitleTa} numberOfLines={1}>{categoryNameTa}</Text> : null}
            <Text style={styles.subtitleInline}>Swipe to browse · Tap to read</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.contentArea}>
        <View style={styles.sectionLabel}>
          <View style={styles.sectionLabelLine} />
          <Text style={styles.sectionLabelText}>
            {items.length} {items.length === 1 ? 'topic' : 'topics'} · Tap a card to read
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ScrollView
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalScroll, { paddingLeft: spacing.screen }]}
          style={styles.cardsScrollView}
        >
          {items.map((item, index) => (
            <AnimatedItemCard
              key={item.id}
              item={item}
              index={index}
              categoryName={categoryName}
              onPress={() => navigation.navigate('CultureDetail', { itemId: item.id, itemName: item.name_en, level })}
            />
          ))}
          <View style={{ width: spacing.screen }} />
        </ScrollView>

        {/* Bottom section: fill marked space with all topics list */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomSectionHeader}>
            <View style={styles.sectionLabelLine} />
            <Text style={styles.bottomSectionTitle}>All topics</Text>
          </View>
          <ScrollView
            style={styles.topicListScroll}
            contentContainerStyle={styles.topicListContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topicPillWrap}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.topicPill, pressed && styles.topicPillPressed]}
                  onPress={() => navigation.navigate('CultureDetail', { itemId: item.id, itemName: item.name_en, level })}
                >
                  <Text style={styles.topicPillEn} numberOfLines={1}>{item.name_en}</Text>
                  {item.name_ta ? <Text style={styles.topicPillTa} numberOfLines={1}>{item.name_ta}</Text> : null}
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.topicPillChevron} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  screenGradient: { ...StyleSheet.absoluteFillObject },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.screenGradientStart,
    zIndex: 10,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: 4 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  headerAccentBar: {
    width: 4,
    borderRadius: 2,
    marginRight: spacing.md,
    height: 48,
  },
  headerTitleBlock: { flex: 1, justifyContent: 'center', minWidth: 0 },
  breadcrumb: {
    fontSize: typography.small,
    color: colors.textMuted,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: typography.extrabold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  headerTitleTa: {
    fontSize: typography.h3,
    color: colors.primary,
    marginTop: 2,
    fontWeight: typography.semibold,
  },
  subtitleInline: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  headerSpacer: { width: 72 },
  contentArea: { flex: 1 },
  cardsScrollView: { maxHeight: CARD_HEIGHT + spacing.lg * 2 },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screen,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  sectionLabelLine: {
    width: 24,
    height: 3,
    borderRadius: radii.line,
    backgroundColor: colors.orange,
  },
  sectionLabelText: {
    fontSize: typography.small,
    color: colors.textMuted,
    fontWeight: typography.medium,
  },
  error: { color: colors.primary, marginHorizontal: spacing.screen, marginBottom: spacing.sm },
  horizontalScroll: { paddingVertical: spacing.lg, paddingLeft: spacing.screen },
  bottomSection: {
    flex: 1,
    marginTop: spacing.md,
    marginHorizontal: spacing.screen,
    minHeight: 120,
  },
  bottomSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bottomSectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textDark,
  },
  topicListScroll: { flex: 1 },
  topicListContent: { paddingBottom: spacing.xl },
  topicPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topicPill: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingRight: 28,
    borderRadius: radii.lg,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderTint,
    width: (SCREEN_WIDTH - spacing.screen * 2 - spacing.sm) / 2,
    ...shadows.card,
  },
  topicPillPressed: { opacity: 0.85 },
  topicPillEn: {
    fontSize: typography.small,
    fontWeight: typography.semibold,
    color: colors.textDark,
  },
  topicPillTa: {
    fontSize: typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  topicPillChevron: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radii.cardLarge,
    overflow: 'hidden',
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.cardCarousel,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  bottomStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_STRIP_HEIGHT,
    justifyContent: 'flex-end',
  },
  bottomStripContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  cardTitle: { fontSize: typography.h2, fontWeight: typography.semibold, color: colors.textOnPrimary, paddingRight: 32 },
  cardTa: { fontSize: typography.small, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  cardArrow: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.md,
  },
});

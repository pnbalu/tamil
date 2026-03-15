import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  typography,
  shadows,
  screenGradientColors,
  accentBarGradientColors,
  toggleActiveGradientColors,
  sectionLineExploreGradientColors,
  sectionLineFeaturedGradientColors,
  cardOverlayGradientColors,
} from '../../theme';
import { radii } from '../../theme/radii';
import { getCategories, getItemsByCategory } from '../../lib/cultureApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = spacing.screen;
const CARD_MARGIN = spacing.md;
const FEATURED_CARD_WIDTH = SCREEN_WIDTH - H_PAD * 2 - CARD_MARGIN;
const FEATURED_CARD_HEIGHT = Math.min(280, SCREEN_HEIGHT * 0.38);
const EXPLORE_CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - spacing.sm) / 2;
const EXPLORE_CARD_HEIGHT = Math.min(200, SCREEN_HEIGHT * 0.26);
const BOTTOM_STRIP_HEIGHT = 80;

// Request small dimensions + quality so file size stays under 100KB
const IMG_OPTS = 'w=400&h=200&fit=crop&q=60';

const CATEGORY_IMAGES = {
  festivals: `https://images.unsplash.com/photo-1605870445919-838d190e8e1b?${IMG_OPTS}`,
  'food-drink': `https://images.unsplash.com/photo-1589302168068-964664d93dc0?${IMG_OPTS}`,
  'family-home': `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?${IMG_OPTS}`,
  nature: `https://images.unsplash.com/photo-1548013146-72479768bada?${IMG_OPTS}`,
  'body-health': `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?${IMG_OPTS}`,
  'time-numbers': `https://images.unsplash.com/photo-1501139083538-0139583c060f?${IMG_OPTS}`,
  'clothing-colors': `https://images.unsplash.com/photo-1558171813-4c088753af8f?${IMG_OPTS}`,
  'travel-places': `https://images.unsplash.com/photo-1544551763-46a013bb70d5?${IMG_OPTS}`,
  'arts-music': `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?${IMG_OPTS}`,
  traditions: `https://images.unsplash.com/photo-1567591400380-2f88c382c2a5?${IMG_OPTS}`,
};

const EXPLORE_COLORS = [
  colors.primary,
  colors.accentGreen,
  colors.navy,
  colors.orange,
  colors.accentPurple,
  colors.accentTeal,
  colors.accentBrown,
  colors.accentForest,
  colors.accentMauve,
  colors.accentWarm,
];

const CATEGORY_ICONS = {
  festivals: 'star',
  'food-drink': 'nutrition',
  'family-home': 'home',
  nature: 'leaf',
  'body-health': 'fitness',
  'time-numbers': 'time',
  'clothing-colors': 'shirt',
  'travel-places': 'location',
  'arts-music': 'musical-notes',
  traditions: 'flower',
};

const CULTURE_WRITEUP = {
  en: 'Here we mean the customs, festivals, food, and daily life that shape Tamil identity. Explore stories and key words around celebrations like Pongal and Diwali, family and home, nature, arts, and traditions. Read in English, learn the Tamil terms, and test yourself with quizzes.',
  ta: 'இங்கு தமிழர் அடையாளத்தை வடிவமைக்கும் பழக்கவழக்கங்கள், திருவிழாக்கள், உணவு, அன்றாட வாழ்க்கை ஆகியவற்றைக் குறிக்கிறோம். பொங்கல், தீபாவளி போன்ற விழாக்கள், குடும்பம், இயற்கை, கலை, பாரம்பரியம் பற்றிய கதைகளையும் சொற்களையும் படியுங்கள். ஆங்கிலத்தில் படித்து, தமிழ்ச் சொற்களைக் கற்று, வினாடி வினாக்களால் சோதித்துப் பாருங்கள்.',
};

function getCategoryImageUrl(cat) {
  if (cat?.image_url) return cat.image_url;
  const slug = (cat?.slug || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.traditions;
}

function getItemImageUrl(item, categorySlug) {
  if (item?.image_url) return item.image_url;
  const slug = (categorySlug || 'festivals').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.traditions;
}

/** Featured item in explore-style card (image, bottom text). Tap -> CultureDetail. */
function FeaturedItemCard({ item, categoryName, level, navigation }) {
  const slug = (categoryName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return (
    <TouchableOpacity
      style={styles.featuredItemCard}
      onPress={() => navigation.getParent()?.navigate('CultureDetail', { itemId: item.id, itemName: item.name_en, level })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: getItemImageUrl(item, slug) }}
        style={styles.exploreCardImage}
        resizeMode="cover"
      />
      <View style={styles.exploreCardOverlay} />
      <View style={styles.exploreBottom}>
        <Text style={styles.exploreTitle} numberOfLines={1}>{item.name_en}</Text>
        {item.name_ta ? <Text style={styles.exploreTa} numberOfLines={1}>{item.name_ta}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

/** Large category card for Explore Topics carousel. Tap -> CultureCategory. */
function CategoryCarouselCard({ cat, level, navigation }) {
  return (
    <TouchableOpacity
      style={styles.carouselCard}
      onPress={() => navigation.getParent()?.navigate('CultureCategory', { categoryId: cat.id, categoryName: cat.name_en, categoryNameTa: cat.name_ta, level })}
      activeOpacity={0.95}
    >
      <Image
        source={{ uri: getCategoryImageUrl(cat) }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredBottom}>
        <LinearGradient colors={cardOverlayGradientColors} style={StyleSheet.absoluteFill} />
        <View style={styles.featuredBottomContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>{cat.name_en}</Text>
          {cat.name_ta ? <Text style={styles.featuredTa} numberOfLines={1}>{cat.name_ta}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CultureHomeScreen({ navigation, profile }) {
  const insets = useSafeAreaInsets();
  const level = profile?.level || 'beginner';
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exploreCarouselIndex, setExploreCarouselIndex] = useState(0);
  const [cultureLang, setCultureLang] = useState('en');
  const exploreCarouselRef = useRef(null);

  useEffect(() => {
    getCategories().then(({ categories: list, error: err }) => {
      setCategories(list || []);
      setError(err || '');
      setLoading(false);
    });
  }, []);

  // Build featured list: one item per category (first item of each)
  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;
    const next = [];
    const run = async () => {
      for (const cat of categories) {
        if (cancelled) return;
        const { items } = await getItemsByCategory(cat.id, level);
        if (items && items.length > 0) next.push({ ...items[0], categoryName: cat.name_en, categoryId: cat.id });
      }
      if (!cancelled) setFeaturedItems(next);
    };
    run();
    return () => { cancelled = true; };
  }, [categories, level]);

  const topPadding = Math.max(insets.top, spacing.lg);

  if (loading) {
  return (
    <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const exploreList = selectedFilter === 'all' ? categories : categories.filter((c) => c.id === selectedFilter);
  const scrollExploreToEnd = () => {
    if (exploreList.length <= 1) return;
    const lastIndex = exploreList.length - 1;
    const x = lastIndex * (FEATURED_CARD_WIDTH + CARD_MARGIN);
    exploreCarouselRef.current?.scrollTo({ x, animated: true });
    setExploreCarouselIndex(lastIndex);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
      {/* Static header – stays fixed while content scrolls */}
      <View style={[styles.headerStatic, { paddingTop: topPadding }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={accentBarGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.accentBar}
          />
          <View>
            <Text style={styles.title}>Culture</Text>
            <Text style={styles.titleTa}>கலாசாரம்</Text>
            <Text style={styles.subtitle}>Swipe to explore · Tap to open</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.geminiBtn} onPress={() => {}} activeOpacity={0.7}>
          <Text style={styles.geminiBtnText}>+ Gemini AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollWrap} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* What is Culture — writeup + toggle (card with gradient border) */}
        <View style={styles.writeupSection}>
          <View style={styles.writeupAccent} />
          <View style={styles.writeupInner}>
            <View style={styles.writeupHeader}>
              <Text style={styles.writeupTitle}>What we mean by Culture</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, cultureLang === 'en' && styles.toggleBtnActive]}
                  onPress={() => setCultureLang('en')}
                  activeOpacity={0.8}
                >
                  {cultureLang === 'en' && (
                    <LinearGradient colors={toggleActiveGradientColors} style={styles.toggleBtnGradient} />
                  )}
                  <Text style={[styles.toggleBtnText, cultureLang === 'en' && styles.toggleBtnTextActive]}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, cultureLang === 'ta' && styles.toggleBtnActive]}
                  onPress={() => setCultureLang('ta')}
                  activeOpacity={0.8}
                >
                  {cultureLang === 'ta' && (
                    <LinearGradient colors={toggleActiveGradientColors} style={styles.toggleBtnGradient} />
                  )}
                  <Text style={[styles.toggleBtnText, cultureLang === 'ta' && styles.toggleBtnTextActive]}>தமிழ்</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.writeupBody}>{CULTURE_WRITEUP[cultureLang]}</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        <TouchableOpacity
          style={[styles.chip, selectedFilter === 'all' && styles.chipSelected]}
          onPress={() => setSelectedFilter('all')}
        >
          <Ionicons name="star" size={16} color={selectedFilter === 'all' ? '#fff' : colors.textMuted} />
          <Text style={[styles.chipText, selectedFilter === 'all' && styles.chipTextSelected]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => {
          const slug = (cat.slug || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const iconName = CATEGORY_ICONS[slug] || 'book';
          const isSelected = selectedFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => setSelectedFilter(selectedFilter === cat.id ? 'all' : cat.id)}
            >
              <Ionicons name={iconName} size={16} color={isSelected ? '#fff' : colors.textMuted} />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} numberOfLines={1}>
                {cat.name_en}
              </Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>

        {/* Explore Topics — carousel with dots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Explore Topics</Text>
              <LinearGradient colors={sectionLineExploreGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionTitleLine} />
            </View>
            <TouchableOpacity onPress={scrollExploreToEnd} disabled={exploreList.length <= 1}>
              <Text style={[styles.seeAll, exploreList.length <= 1 && styles.seeAllDisabled]}>See all →</Text>
            </TouchableOpacity>
          </View>
        {exploreList.length > 0 ? (
          <>
            <ScrollView
              ref={exploreCarouselRef}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={FEATURED_CARD_WIDTH + CARD_MARGIN}
              snapToAlignment="start"
              contentContainerStyle={styles.featuredScrollContent}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const index = Math.round(x / (FEATURED_CARD_WIDTH + CARD_MARGIN));
                setExploreCarouselIndex(Math.min(Math.max(0, index), exploreList.length - 1));
              }}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const index = Math.round(x / (FEATURED_CARD_WIDTH + CARD_MARGIN));
                setExploreCarouselIndex(Math.min(Math.max(0, index), exploreList.length - 1));
              }}
              scrollEventThrottle={16}
            >
              {exploreList.map((cat) => (
                <View key={cat.id} style={[styles.carouselCardWrap, { width: FEATURED_CARD_WIDTH + CARD_MARGIN }]}>
                  <CategoryCarouselCard cat={cat} level={level} navigation={navigation} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.dots}>
              {exploreList.map((_, i) => (
                <View key={i} style={[styles.dot, i === exploreCarouselIndex && styles.dotActive]} />
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.carouselCard, styles.featuredCardPlaceholder]}>
            <Text style={styles.placeholderText}>No topics</Text>
          </View>
        )}
      </View>

        {/* Featured — explore-style cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured</Text>
              <LinearGradient colors={sectionLineFeaturedGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionTitleLine} />
            </View>
            <TouchableOpacity
            onPress={() => categories[0] && navigation.getParent()?.navigate('CultureCategory', { categoryId: categories[0].id, categoryName: categories[0].name_en, categoryNameTa: categories[0].name_ta, level })}
          >
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {featuredItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreRow}
          >
            {featuredItems.map((item) => (
              <View key={item.id} style={styles.featuredItemCardWrap}>
                <FeaturedItemCard
                  item={item}
                  categoryName={item.categoryName}
                  level={level}
                  navigation={navigation}
                />
              </View>
            ))}
            <View style={{ width: H_PAD }} />
          </ScrollView>
        ) : (
          <View style={[styles.carouselCard, styles.featuredCardPlaceholder]}>
            <Text style={styles.placeholderText}>No featured topic yet</Text>
          </View>
        )}
      </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scrollWrap: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerStatic: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.lg,
    backgroundColor: colors.screenGradientStart,
    zIndex: 10,
    elevation: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  accentBar: {
    width: 5,
    borderRadius: radii.accentBar,
    marginRight: spacing.md,
    height: 52,
  },
  title: { fontSize: typography.display, fontWeight: typography.extrabold, color: colors.textDark, letterSpacing: 0.5 },
  titleTa: { fontSize: typography.h3, color: colors.primary, marginTop: 2, fontWeight: typography.semibold },
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.xs },
  geminiBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  geminiBtnText: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.primary },
  error: { color: colors.primary, marginHorizontal: H_PAD, marginBottom: spacing.sm },
  writeupSection: {
    marginHorizontal: H_PAD,
    marginBottom: spacing.xl,
    borderRadius: radii.lg + 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardBg,
    ...shadows.card,
  },
  writeupAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.orange,
  },
  writeupInner: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 8,
  },
  writeupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  writeupTitle: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.textDark },
  toggleRow: { flexDirection: 'row', gap: spacing.xs },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.screenBg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  toggleBtnActive: {
    borderColor: 'transparent',
  },
  toggleBtnGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.sm - 1,
  },
  toggleBtnText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  toggleBtnTextActive: { color: '#fff', fontWeight: '600' },
  writeupBody: {
    fontSize: typography.sub,
    lineHeight: 22,
    color: colors.textDark,
  },
  chipScroll: { marginBottom: spacing.md },
  chipRow: { paddingHorizontal: H_PAD, gap: spacing.sm, paddingRight: H_PAD * 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.chip,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.chipSelected,
  },
  chipText: { fontSize: typography.sub, color: colors.textDark, fontWeight: typography.medium },
  chipTextSelected: { color: colors.textOnPrimary },
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 19, fontWeight: typography.extrabold, color: colors.textDark, letterSpacing: 0.3 },
  sectionTitleLine: {
    height: 3,
    borderRadius: radii.line,
    marginTop: spacing.xs,
    width: 48,
  },
  seeAll: { fontSize: typography.sub, color: colors.primary, fontWeight: typography.bold },
  seeAllDisabled: { color: colors.textMuted, opacity: 0.7 },
  featuredScrollContent: {
    paddingLeft: H_PAD,
    paddingRight: H_PAD,
  },
  featuredItemCardWrap: { marginBottom: spacing.sm },
  featuredItemCard: {
    width: EXPLORE_CARD_WIDTH,
    height: EXPLORE_CARD_HEIGHT,
    borderRadius: radii.lg + 2,
    overflow: 'hidden',
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.cardSmall,
  },
  carouselCardWrap: { marginBottom: spacing.sm },
  carouselCard: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    borderRadius: radii.cardLarge,
    overflow: 'hidden',
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.cardCarousel,
  },
  featuredCardPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 15, color: colors.textMuted },
  featuredImage: { ...StyleSheet.absoluteFillObject },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  featuredBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_STRIP_HEIGHT,
    justifyContent: 'flex-end',
  },
  featuredBottomContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'relative',
  },
  featuredTitle: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textOnPrimary },
  featuredTa: { fontSize: typography.body, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
    borderRadius: 4,
    opacity: 1,
  },
  exploreRow: { paddingHorizontal: H_PAD, gap: spacing.sm },
  exploreCard: {
    width: EXPLORE_CARD_WIDTH,
    height: EXPLORE_CARD_HEIGHT,
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: spacing.md,
  },
  exploreCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  exploreCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  exploreBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.gold,
  },
  exploreBadgeNew: { backgroundColor: colors.success },
  exploreBadgeText: { fontSize: typography.label, fontWeight: typography.bold, color: colors.textOnPrimary },
  exploreBottom: { flex: 1, justifyContent: 'flex-end', paddingTop: spacing.sm, position: 'absolute', bottom: 0, left: spacing.md, right: spacing.md },
  exploreTitle: { fontSize: typography.sub, fontWeight: typography.semibold, color: colors.textOnPrimary },
  exploreTa: { fontSize: typography.small, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
});

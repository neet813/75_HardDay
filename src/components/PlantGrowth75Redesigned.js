import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Svg, G, Path, Circle, Ellipse, Rect, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
  // Ocean Theme
  oceanLight: '#A8D5F7',
  oceanMid: '#5DA3D5',
  oceanDark: '#2E5A8C',
  oceanVeryDark: '#1A3A5C',
  
  // Land Theme
  landLight: '#F4C4D4',
  landMid: '#E89BAD',
  landDark: '#D1748A',
  
  // Accents
  coralRed: '#FF6B6B',
  seaweedGreen: '#4A9B6F',
  sandBeige: '#F5DEB3',
  plantGreen: '#7CB342',
  darkGreen: '#1B5E20',
  skyYellow: '#FFD700',
  flowerPink: '#FF69B4',
  
  // UI
  white: '#FFFFFF',
  gray: '#CCCCCC',
  darkGray: '#333333',
};

// ============= OCEAN WORLD COMPONENTS =============

const OceanTerrain = () => (
  <Svg width="100%" height={400} viewBox="0 0 400 400" style={{ marginBottom: -2 }}>
    <Defs>
      <LinearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.oceanLight} stopOpacity="1" />
        <Stop offset="100%" stopColor={COLORS.oceanMid} stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="sandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.sandBeige} stopOpacity="1" />
        <Stop offset="100%" stopColor="#E8D7A0" stopOpacity="1" />
      </LinearGradient>
    </Defs>

    {/* Background water */}
    <Rect width="400" height="400" fill="url(#oceanGradient)" />

    {/* Bubbles floating */}
    <Circle cx="80" cy="60" r="12" fill={COLORS.oceanLight} opacity="0.4" />
    <Circle cx="320" cy="100" r="8" fill={COLORS.oceanLight} opacity="0.3" />
    <Circle cx="200" cy="80" r="6" fill={COLORS.oceanLight} opacity="0.35" />

    {/* Sand base - isometric style */}
    <Polygon
      points="0,300 200,250 400,300 200,350"
      fill="url(#sandGradient)"
    />
    <Polygon
      points="0,300 200,250 200,350 0,400"
      fill="#D4C5A0"
    />
    <Polygon
      points="400,300 200,250 200,350 400,400"
      fill="#E8D7A0"
    />

    {/* Seaweed on left */}
    <Path
      d="M 60 300 Q 55 280 60 260 Q 65 240 60 220"
      stroke={COLORS.seaweedGreen}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M 100 300 Q 95 270 100 240 Q 105 210 100 180"
      stroke={COLORS.seaweedGreen}
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M 140 300 Q 135 285 140 270"
      stroke={COLORS.seaweedGreen}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Coral on left */}
    <Path
      d="M 50 320 L 50 300 L 35 300 M 50 310 L 65 310"
      stroke={COLORS.coralRed}
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="30" cy="310" r="4" fill={COLORS.coralRed} />
    <Circle cx="70" cy="310" r="4" fill={COLORS.coralRed} />

    {/* Seaweed on right */}
    <Path
      d="M 280 300 Q 275 275 280 250 Q 285 225 280 200"
      stroke={COLORS.seaweedGreen}
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M 320 300 Q 315 280 320 260"
      stroke={COLORS.seaweedGreen}
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />

    {/* Yellow seaweed */}
    <Path
      d="M 180 300 Q 175 270 180 240"
      stroke="#D4AF37"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

const Fish = ({ x, y, size = 30, direction = 1 }) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 60 36" style={{ position: 'absolute', left: x, top: y }}>
    {/* Fish body */}
    <Ellipse cx="30" cy="18" rx="18" ry="12" fill={direction > 0 ? COLORS.oceanMid : COLORS.oceanMid} />
    {/* Eye */}
    <Circle cx={direction > 0 ? 38 : 22} cy="15" r="3" fill={COLORS.white} />
    <Circle cx={direction > 0 ? 38 : 22} cy="15" r="1.5" fill={COLORS.darkGray} />
    {/* Tail */}
    <Polygon
      points={direction > 0 ? "10,18 0,10 0,26" : "50,18 60,10 60,26"}
      fill={COLORS.oceanDark}
    />
    {/* Fin */}
    <Ellipse cx="30" cy="8" rx="6" ry="5" fill={COLORS.oceanDark} />
  </Svg>
);

const WhaleSegment = ({ x, y, size = 50 }) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 90 60" style={{ position: 'absolute', left: x, top: y }}>
    {/* Large whale body */}
    <Ellipse cx="45" cy="30" rx="35" ry="22" fill={COLORS.oceanVeryDark} />
    {/* Eye */}
    <Circle cx="65" cy="20" r="4" fill={COLORS.white} />
    <Circle cx="65" cy="20" r="2" fill={COLORS.darkGray} />
    {/* Spout */}
    <Circle cx="50" cy="5" r="3" fill={COLORS.oceanLight} opacity="0.6" />
  </Svg>
);

const OceanWorldScreen = ({ dayNumber, tasksCompleted }) => {
  const fishAnim = useSharedValue(0);

  useEffect(() => {
    fishAnim.value = withTiming(1, { duration: 3000 }, (finished) => {
      if (finished) fishAnim.value = 0;
    });
  }, []);

  const fishStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(fishAnim.value, [0, 1], [0, 60], Extrapolate.CLAMP) },
    ],
  }));

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.oceanHeader}>
        <View style={styles.healthBar}>
          <Text style={styles.healthText}>❤️ 1000+</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.iconText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.iconText}>≡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.iconText}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ocean terrain with creatures */}
      <View style={{ position: 'relative', height: 400, width: '100%' }}>
        <OceanTerrain />

        {/* Fish animation */}
        <Animated.View style={fishStyle}>
          <Fish x={80} y={120} size={35} direction={1} />
        </Animated.View>

        {/* Small fish school */}
        <Fish x={200} y={100} size={20} direction={1} />
        <Fish x={220} y={110} size={18} direction={1} />
        <Fish x={240} y={105} size={19} direction={1} />

        {/* Whale in distance */}
        <WhaleSegment x={150} y={180} size={40} />
      </View>

      {/* Task card */}
      <View style={styles.taskCard}>
        <View style={styles.taskCardHeader}>
          <Text style={styles.taskDate}>3/25/25</Text>
          <Text style={styles.taskTitle}>Drink water daily</Text>
        </View>
        <Text style={styles.taskDescription}>5 times a week{'\n'}1 times a day</Text>
        <View style={styles.taskProgress}>
          <View style={[styles.progressDot, { backgroundColor: COLORS.oceanMid }]} />
          <View style={[styles.progressLine, { backgroundColor: COLORS.gray, flex: 1 }]} />
          <View style={[styles.progressDot, { backgroundColor: COLORS.gray }]} />
        </View>
      </View>

      {/* Collectibles at bottom */}
      <View style={styles.collectibles}>
        <View style={styles.collectibleItem}>
          <Text style={styles.collectibleEmoji}>⭐</Text>
          <Text style={styles.collectibleCount}>3</Text>
        </View>
        <View style={styles.collectibleItem}>
          <Text style={styles.collectibleEmoji}>💛</Text>
          <Text style={styles.collectibleCount}>2</Text>
        </View>
      </View>
    </View>
  );
};

// ============= LAND WORLD COMPONENTS =============

const LandTerrain = () => (
  <Svg width="100%" height={400} viewBox="0 0 400 400" style={{ marginBottom: -2 }}>
    <Defs>
      <LinearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.landLight} stopOpacity="1" />
        <Stop offset="100%" stopColor={COLORS.landMid} stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="groundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F9D9E5" stopOpacity="1" />
        <Stop offset="100%" stopColor="#E8A8C8" stopOpacity="1" />
      </LinearGradient>
    </Defs>

    {/* Sky background */}
    <Rect width="400" height="400" fill="url(#skyGradient)" />

    {/* Moon */}
    <Circle cx="320" cy="60" r="25" fill={COLORS.skyYellow} opacity="0.8" />

    {/* Birds flying */}
    <Text x="250" y="100" fontSize="14" textAnchor="middle">🦅</Text>
    <Text x="280" y="120" fontSize="12" textAnchor="middle">🦅</Text>
    <Text x="220" y="110" fontSize="12" textAnchor="middle">🦅</Text>

    {/* Ground - isometric style */}
    <Polygon
      points="0,280 200,230 400,280 200,330"
      fill="url(#groundGradient)"
    />
    <Polygon
      points="0,280 200,230 200,330 0,380"
      fill="#E8A8C8"
    />
    <Polygon
      points="400,280 200,230 200,330 400,380"
      fill="#F9D9E5"
    />

    {/* Palm trees arranged in grid on ground */}
    {/* Row 1 */}
    <PalmTree x="60" y="290" size={30} />
    <PalmTree x="120" y="290" size={32} />
    <PalmTree x="180" y="280" size={28} />
    <PalmTree x="240" y="290" size={31} />
    <PalmTree x="300" y="285" size={29} />
    <PalmTree x="360" y="290" size={30} />

    {/* Row 2 - smaller in back */}
    <PalmTree x="90" y="250" size={24} />
    <PalmTree x="150" y="255" size={25} />
    <PalmTree x="210" y="250" size={23} />
    <PalmTree x="270" y="255" size={24} />
    <PalmTree x="330" y="252" size={22} />

    {/* Orca whale tail in water (background) */}
    <Polygon
      points="200,200 210,170 190,170"
      fill="#000000"
      opacity="0.7"
    />
  </Svg>
);

const PalmTree = ({ x, y, size = 30 }) => (
  <G key={`palm-${x}-${y}`}>
    {/* Trunk */}
    <Rect x={x - 2} y={y} width="4" height={size} fill="#8B7355" />
    {/* Fronds - circle approximation */}
    <Circle cx={x} cy={y - size} r={size * 0.5} fill={COLORS.plantGreen} opacity="0.8" />
    <Circle cx={x - size * 0.3} cy={y - size * 0.6} r={size * 0.4} fill={COLORS.darkGreen} opacity="0.7" />
    <Circle cx={x + size * 0.3} cy={y - size * 0.6} r={size * 0.4} fill={COLORS.darkGreen} opacity="0.7" />
  </G>
);

const Orca = ({ x, y, size = 50 }) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 90 60" style={{ position: 'absolute', left: x, top: y }}>
    {/* Orca body */}
    <Ellipse cx="45" cy="30" rx="35" ry="20" fill="#000000" />
    {/* White belly */}
    <Ellipse cx="45" cy="35" rx="20" ry="10" fill={COLORS.white} />
    {/* White eye patch */}
    <Circle cx="60" cy="20" r="6" fill={COLORS.white} />
    {/* Dorsal fin */}
    <Polygon points="45,5 42,15 48,15" fill="#000000" />
    {/* Tail flukes */}
    <Polygon points="15,30 5,20 10,30 5,40" fill="#000000" />
  </Svg>
);

const Airplane = ({ x, y, size = 40 }) => (
  <Svg width={size * 1.2} height={size} viewBox="0 0 50 30" style={{ position: 'absolute', left: x, top: y }}>
    {/* Fuselage */}
    <Ellipse cx="25" cy="15" rx="20" ry="6" fill="#E74C3C" />
    {/* Cockpit */}
    <Circle cx="32" cy="12" r="4" fill="#34495E" />
    {/* Wings */}
    <Rect x="10" y="13" width="30" height="4" fill="#E74C3C" />
    {/* Tail */}
    <Polygon points="8,13 8,17 3,15" fill="#34495E" />
  </Svg>
);

const LandWorldScreen = ({ dayNumber, tasksCompleted }) => {
  const orcaAnim = useSharedValue(0);
  const airplaneAnim = useSharedValue(0);

  useEffect(() => {
    orcaAnim.value = withTiming(1, { duration: 4000 }, (finished) => {
      if (finished) orcaAnim.value = 0;
    });
    airplaneAnim.value = withTiming(1, { duration: 5000 }, (finished) => {
      if (finished) airplaneAnim.value = 0;
    });
  }, []);

  const orcaStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orcaAnim.value, [0, 1], [-100, 200], Extrapolate.CLAMP) },
    ],
  }));

  const airplaneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(airplaneAnim.value, [0, 1], [400, -50], Extrapolate.CLAMP) },
      { translateY: interpolate(airplaneAnim.value, [0, 0.5, 1], [0, -30, 0], Extrapolate.CLAMP) },
    ],
  }));

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.landHeader}>
        <Text style={styles.dayCounter}>Day {dayNumber}/75</Text>
      </View>

      {/* Land terrain with creatures */}
      <View style={{ position: 'relative', height: 400, width: '100%' }}>
        <LandTerrain />

        {/* Orca swimming in background water */}
        <Animated.View style={orcaStyle}>
          <Orca x={100} y={150} size={45} />
        </Animated.View>

        {/* Airplane flying */}
        <Animated.View style={airplaneStyle}>
          <Airplane x={200} y={100} size={40} />
        </Animated.View>
      </View>

      {/* Task completion grid */}
      <View style={styles.taskGrid}>
        {[...Array(10)].map((_, i) => (
          <View key={i} style={styles.taskGridItem}>
            <Text style={styles.taskGridLabel}>
              {Math.floor(i / 5) + 1}/{i % 5 + 1}
            </Text>
            <View style={[
              styles.taskGridBox,
              { backgroundColor: i < tasksCompleted ? COLORS.flowerPink : COLORS.gray }
            ]} />
          </View>
        ))}
      </View>

      {/* Bottom icons */}
      <View style={styles.bottomIcons}>
        <Text style={styles.bottomIcon}>🌙</Text>
        <Text style={styles.bottomIcon}>🦈</Text>
        <Text style={styles.bottomIcon}>🦅</Text>
      </View>
    </View>
  );
};

// ============= MAIN COMPONENT =============

const PlantGrowth75 = ({ dayNumber = 1, tasksCompleted = 0 }) => {
  const [activeTab, setActiveTab] = useState('ocean');

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveTab(pageIndex === 0 ? 'ocean' : 'land');
        }}
        scrollEnabled={false}
      >
        <View style={{ width }}>
          <OceanWorldScreen dayNumber={dayNumber} tasksCompleted={tasksCompleted} />
        </View>
        <View style={{ width }}>
          <LandWorldScreen dayNumber={dayNumber} tasksCompleted={tasksCompleted} />
        </View>
      </ScrollView>

      {/* Tab indicator */}
      <View style={styles.tabIndicator}>
        <TouchableOpacity
          style={[styles.tabDot, { backgroundColor: activeTab === 'ocean' ? COLORS.oceanMid : COLORS.gray }]}
          onPress={() => setActiveTab('ocean')}
        />
        <TouchableOpacity
          style={[styles.tabDot, { backgroundColor: activeTab === 'land' ? COLORS.landMid : COLORS.gray }]}
          onPress={() => setActiveTab('land')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.oceanLight,
  },
  screenContainer: {
    flex: 1,
    width,
    backgroundColor: COLORS.oceanLight,
  },
  
  // Ocean styles
  oceanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.oceanMid,
  },
  landHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.landMid,
  },
  healthBar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.oceanMid,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  taskCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.oceanLight,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.oceanMid,
  },
  taskCardHeader: {
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: COLORS.oceanMid,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 12,
    lineHeight: 18,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    height: 4,
    borderRadius: 2,
  },
  collectibles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
  },
  collectibleItem: {
    alignItems: 'center',
  },
  collectibleEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  collectibleCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  
  // Land styles
  dayCounter: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  taskGridItem: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  taskGridBox: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
  },
  bottomIcon: {
    fontSize: 28,
  },
  
  // Tab indicator
  tabIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default PlantGrowth75;

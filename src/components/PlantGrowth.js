import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Svg, G, Path, Circle, Ellipse, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const PlantGrowth = ({ 
  dayNumber = 1, 
  isReset = false, 
  onWaterPlant = null,
  tasksCompleted = 0,
}) => {
  const [plantStage, setPlantStage] = useState('tiny');
  const [hasWatered, setHasWatered] = useState(tasksCompleted === 5);
  const [celebrateWater, setCelebrateWater] = useState(false);
  const [startNewGrowth, setStartNewGrowth] = useState(false);

  const growthProgress = useSharedValue(0);
  const waterDropProgress = useSharedValue(0);
  const leafFallProgress = useSharedValue(0);
  const newLeafProgress = useSharedValue(0);
  const plantScale = useSharedValue(1);
  const plantRotation = useSharedValue(0);
  const leafOpacity = useSharedValue(1);

  // Determine plant stage based on day number
  useEffect(() => {
    if (dayNumber <= 10) {
      setPlantStage('tiny');
      growthProgress.value = withTiming(dayNumber / 10, { duration: 800 });
    } else if (dayNumber <= 30) {
      setPlantStage('small');
      growthProgress.value = withTiming(0.3 + (dayNumber - 10) / 20 * 0.2, { duration: 800 });
    } else if (dayNumber <= 50) {
      setPlantStage('growing');
      growthProgress.value = withTiming(0.5 + (dayNumber - 30) / 20 * 0.2, { duration: 800 });
    } else if (dayNumber <= 70) {
      setPlantStage('medium');
      growthProgress.value = withTiming(0.7 + (dayNumber - 50) / 20 * 0.15, { duration: 800 });
    } else {
      setPlantStage('blossoming');
      growthProgress.value = withTiming(1, { duration: 800 });
    }
  }, [dayNumber]);

  // Handle watering animation when all tasks completed
  useEffect(() => {
    if (tasksCompleted === 5 && !hasWatered) {
      setHasWatered(true);
      triggerWateringAnimation();
    }
  }, [tasksCompleted]);

  // Handle reset - leaves fall
  useEffect(() => {
    if (isReset) {
      leafFallProgress.value = withTiming(1, { duration: 2000 }, (finished) => {
        if (finished) {
          leafOpacity.value = withTiming(0, { duration: 300 });
          setStartNewGrowth(false);
        }
      });
    } else if (startNewGrowth && isReset) {
      // New leaves sprouting
      leafOpacity.value = withTiming(1, { duration: 800 });
      newLeafProgress.value = withTiming(1, { duration: 1500 });
    }
  }, [isReset]);

  const triggerWateringAnimation = () => {
    setCelebrateWater(true);
    
    // Water drop animation
    waterDropProgress.value = withTiming(1, { duration: 1200 }, () => {
      // Plant bounce
      plantScale.value = withSpring(1.1, { damping: 5, mass: 0.5 });
      setTimeout(() => {
        plantScale.value = withSpring(1, { damping: 5, mass: 0.5 });
      }, 200);
      waterDropProgress.value = 0;
    });

    setTimeout(() => setCelebrateWater(false), 1200);
  };

  const getMotivationalMessage = () => {
    if (isReset && leafFallProgress.value < 1) {
      return "Keep going! Your plant is resilient 💪";
    }
    if (isReset && leafOpacity.value === 0) {
      return "The plant didn't give up. New leaves will grow when you continue 🌱";
    }
    if (startNewGrowth && newLeafProgress.value > 0) {
      return "New leaves are growing! You're stronger than ever 🌿";
    }
    if (celebrateWater) {
      return "Your plant is happy and well-watered! 💧";
    }
    if (plantStage === 'blossoming') {
      return "You did it! Your plant is blooming! 🌸";
    }
    if (plantStage === 'medium') {
      return "Your plant is growing beautifully! 🌿";
    }
    if (plantStage === 'growing') {
      return "Your dedication is showing! 🌱";
    }
    if (plantStage === 'small') {
      return "Your plant is getting stronger! 💚";
    }
    return "Your plant has sprouted! Keep going! 🌱";
  };

  const animatedPlantStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: plantScale.value },
      { rotate: `${plantRotation.value}deg` },
    ],
  }));

  const animatedLeafFallStyle = useAnimatedStyle(() => ({
    opacity: leafOpacity.value,
  }));

  // SVG Plant Components
  const TinyPlantSVG = ({ scale }) => (
    <Svg width={140 * scale} height={180 * scale} viewBox="0 0 140 180">
      <Defs>
        <LinearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B6F47" stopOpacity="1" />
          <Stop offset="100%" stopColor="#704214" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#90EE90" stopOpacity="1" />
          <Stop offset="100%" stopColor="#228B22" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Stem */}
      <Path
        d="M 70 140 Q 68 110 70 80"
        stroke="url(#stemGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left Leaves */}
      <Ellipse cx="50" cy="110" rx="12" ry="18" fill="url(#leafGradient)" transform="rotate(-40 50 110)" />
      <Ellipse cx="45" cy="90" rx="10" ry="16" fill="#90EE90" transform="rotate(-35 45 90)" />

      {/* Right Leaves */}
      <Ellipse cx="90" cy="110" rx="12" ry="18" fill="url(#leafGradient)" transform="rotate(40 90 110)" />
      <Ellipse cx="95" cy="90" rx="10" ry="16" fill="#90EE90" transform="rotate(35 95 90)" />

      {/* Center Leaf */}
      <Ellipse cx="70" cy="75" rx="9" ry="14" fill="#228B22" />
    </Svg>
  );

  const SmallPlantSVG = ({ scale }) => (
    <Svg width={160 * scale} height={200 * scale} viewBox="0 0 160 200">
      <Defs>
        <LinearGradient id="stemGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B6F47" stopOpacity="1" />
          <Stop offset="100%" stopColor="#704214" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7CB342" stopOpacity="1" />
          <Stop offset="100%" stopColor="#1B5E20" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Stem */}
      <Path
        d="M 80 160 Q 77 120 80 70"
        stroke="url(#stemGradient2)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Larger Leaves */}
      <Ellipse cx="55" cy="125" rx="14" ry="22" fill="url(#leafGradient2)" transform="rotate(-45 55 125)" />
      <Ellipse cx="48" cy="100" rx="12" ry="20" fill="#7CB342" transform="rotate(-40 48 100)" />
      <Ellipse cx="105" cy="125" rx="14" ry="22" fill="url(#leafGradient2)" transform="rotate(45 105 125)" />
      <Ellipse cx="112" cy="100" rx="12" ry="20" fill="#7CB342" transform="rotate(40 112 100)" />

      {/* Center Leaf */}
      <Ellipse cx="80" cy="80" rx="10" ry="16" fill="#1B5E20" />

      {/* Small Flower Bud */}
      <Circle cx="80" cy="55" r="5" fill="#FFB6C1" opacity="0.7" />
    </Svg>
  );

  const GrowingPlantSVG = ({ scale }) => (
    <Svg width={180 * scale} height={220 * scale} viewBox="0 0 180 220">
      <Defs>
        <LinearGradient id="stemGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B6F47" stopOpacity="1" />
          <Stop offset="100%" stopColor="#704214" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leafGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7CB342" stopOpacity="1" />
          <Stop offset="100%" stopColor="#1B5E20" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Stem */}
      <Path
        d="M 90 180 Q 87 130 90 60"
        stroke="url(#stemGradient3)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* More Leaves - 7 total */}
      <Ellipse cx="60" cy="145" rx="15" ry="24" fill="url(#leafGradient3)" transform="rotate(-50 60 145)" />
      <Ellipse cx="52" cy="115" rx="13" ry="22" fill="#7CB342" transform="rotate(-45 52 115)" />
      <Ellipse cx="120" cy="145" rx="15" ry="24" fill="url(#leafGradient3)" transform="rotate(50 120 145)" />
      <Ellipse cx="128" cy="115" rx="13" ry="22" fill="#7CB342" transform="rotate(45 128 115)" />
      <Ellipse cx="90" cy="100" rx="11" ry="18" fill="#1B5E20" />
      <Ellipse cx="75" cy="85" rx="10" ry="16" fill="#7CB342" transform="rotate(-30 75 85)" />
      <Ellipse cx="105" cy="85" rx="10" ry="16" fill="#7CB342" transform="rotate(30 105 85)" />

      {/* Flowers */}
      <Circle cx="90" cy="50" r="6" fill="#FFB6C1" />
      <Circle cx="82" cy="45" r="4" fill="#FFB6C1" opacity="0.8" />
      <Circle cx="98" cy="45" r="4" fill="#FFB6C1" opacity="0.8" />
    </Svg>
  );

  const MediumPlantSVG = ({ scale }) => (
    <Svg width={200 * scale} height={260 * scale} viewBox="0 0 200 260">
      <Defs>
        <LinearGradient id="stemGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B6F47" stopOpacity="1" />
          <Stop offset="100%" stopColor="#704214" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leafGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7CB342" stopOpacity="1" />
          <Stop offset="100%" stopColor="#1B5E20" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Main Stem */}
      <Path
        d="M 100 220 Q 97 160 100 60"
        stroke="url(#stemGradient4)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Branches */}
      <Path
        d="M 100 140 L 70 130"
        stroke="url(#stemGradient4)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 100 140 L 130 130"
        stroke="url(#stemGradient4)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leaves - 9 total */}
      <Ellipse cx="55" cy="165" rx="16" ry="26" fill="url(#leafGradient4)" transform="rotate(-55 55 165)" />
      <Ellipse cx="45" cy="130" rx="14" ry="24" fill="#7CB342" transform="rotate(-50 45 130)" />
      <Ellipse cx="145" cy="165" rx="16" ry="26" fill="url(#leafGradient4)" transform="rotate(55 145 165)" />
      <Ellipse cx="155" cy="130" rx="14" ry="24" fill="#7CB342" transform="rotate(50 155 130)" />
      <Ellipse cx="100" cy="110" rx="12" ry="20" fill="#1B5E20" />
      <Ellipse cx="80" cy="90" rx="11" ry="18" fill="#7CB342" transform="rotate(-35 80 90)" />
      <Ellipse cx="120" cy="90" rx="11" ry="18" fill="#7CB342" transform="rotate(35 120 90)" />
      <Ellipse cx="70" cy="75" rx="10" ry="16" fill="#1B5E20" transform="rotate(-40 70 75)" />
      <Ellipse cx="130" cy="75" rx="10" ry="16" fill="#1B5E20" transform="rotate(40 130 75)" />

      {/* Multiple Flowers */}
      <Circle cx="100" cy="45" r="7" fill="#FF69B4" />
      <Circle cx="70" cy="50" r="6" fill="#FFD700" />
      <Circle cx="130" cy="50" r="6" fill="#FF69B4" />
      <Circle cx="92" cy="35" r="5" fill="#FFD700" opacity="0.8" />
      <Circle cx="108" cy="35" r="5" fill="#FF69B4" opacity="0.8" />
    </Svg>
  );

  const BlossoningPlantSVG = ({ scale }) => (
    <Svg width={220 * scale} height={300 * scale} viewBox="0 0 220 300">
      <Defs>
        <LinearGradient id="stemGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B6F47" stopOpacity="1" />
          <Stop offset="100%" stopColor="#704214" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leafGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7CB342" stopOpacity="1" />
          <Stop offset="100%" stopColor="#1B5E20" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Main Stem */}
      <Path
        d="M 110 260 Q 107 190 110 60"
        stroke="url(#stemGradient5)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Multiple Branches */}
      <Path
        d="M 110 170 L 70 155"
        stroke="url(#stemGradient5)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 110 170 L 150 155"
        stroke="url(#stemGradient5)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 110 120 L 75 105"
        stroke="url(#stemGradient5)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 110 120 L 145 105"
        stroke="url(#stemGradient5)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leaves - 12 total */}
      <Ellipse cx="50" cy="185" rx="17" ry="28" fill="url(#leafGradient5)" transform="rotate(-60 50 185)" />
      <Ellipse cx="40" cy="150" rx="15" ry="26" fill="#7CB342" transform="rotate(-55 40 150)" />
      <Ellipse cx="170" cy="185" rx="17" ry="28" fill="url(#leafGradient5)" transform="rotate(60 170 185)" />
      <Ellipse cx="180" cy="150" rx="15" ry="26" fill="#7CB342" transform="rotate(55 180 150)" />
      <Ellipse cx="110" cy="130" rx="13" ry="22" fill="#1B5E20" />
      <Ellipse cx="85" cy="105" rx="12" ry="20" fill="#7CB342" transform="rotate(-40 85 105)" />
      <Ellipse cx="135" cy="105" rx="12" ry="20" fill="#7CB342" transform="rotate(40 135 105)" />
      <Ellipse cx="70" cy="85" rx="11" ry="18" fill="#1B5E20" transform="rotate(-45 70 85)" />
      <Ellipse cx="150" cy="85" rx="11" ry="18" fill="#1B5E20" transform="rotate(45 150 85)" />
      <Ellipse cx="60" cy="60" rx="10" ry="16" fill="#7CB342" transform="rotate(-50 60 60)" />
      <Ellipse cx="160" cy="60" rx="10" ry="16" fill="#7CB342" transform="rotate(50 160 60)" />
      <Ellipse cx="110" cy="50" rx="9" ry="15" fill="#1B5E20" />

      {/* Many Flowers - Colorful Blooms */}
      <Circle cx="110" cy="35" r="8" fill="#FF1493" />
      <Circle cx="70" cy="45" r="7" fill="#FFD700" />
      <Circle cx="150" cy="45" r="7" fill="#FF69B4" />
      <Circle cx="55" cy="70" r="6" fill="#FF6347" />
      <Circle cx="165" cy="70" r="6" fill="#FFD700" />
      <Circle cx="100" cy="25" r="6" fill="#FF69B4" opacity="0.9" />
      <Circle cx="120" cy="25" r="6" fill="#FF1493" opacity="0.9" />
      <Circle cx="40" cy="55" r="5" fill="#FFD700" opacity="0.8" />
      <Circle cx="180" cy="55" r="5" fill="#FF6347" opacity="0.8" />
    </Svg>
  );

  const renderPlant = () => {
    const scale = interpolate(
      growthProgress.value,
      [0, 0.3, 0.5, 0.7, 1],
      [0.6, 0.8, 1, 1.2, 1.4]
    );

    switch (plantStage) {
      case 'tiny':
        return <TinyPlantSVG scale={scale} />;
      case 'small':
        return <SmallPlantSVG scale={scale} />;
      case 'growing':
        return <GrowingPlantSVG scale={scale} />;
      case 'medium':
        return <MediumPlantSVG scale={scale} />;
      case 'blossoming':
        return <BlossoningPlantSVG scale={scale} />;
      default:
        return <TinyPlantSVG scale={0.8} />;
    }
  };

  // Water drops animation
  const WaterDropAnimation = () => {
    const dropPositions = [
      { x: '30%', initialY: -30 },
      { x: '50%', initialY: -40 },
      { x: '70%', initialY: -35 },
    ];

    return (
      <>
        {dropPositions.map((drop, idx) => {
          const dropAnimatedStyle = useAnimatedStyle(() => {
            const yPosition = interpolate(
              waterDropProgress.value,
              [0, 1],
              [drop.initialY, 80],
              Extrapolate.CLAMP
            );
            const opacity = interpolate(
              waterDropProgress.value,
              [0, 0.8, 1],
              [1, 1, 0],
              Extrapolate.CLAMP
            );
            return {
              transform: [{ translateY: yPosition }],
              opacity,
            };
          });

          return (
            <Animated.View
              key={`water-${idx}`}
              style={[
                {
                  position: 'absolute',
                  left: drop.x,
                  top: '20%',
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#87CEEB',
                },
                dropAnimatedStyle,
              ]}
            />
          );
        })}
      </>
    );
  };

  // Falling leaves animation (simplified - in real app use Lottie)
  const FallingLeaves = () => {
    const leaves = [
      { x: '20%', delay: 0 },
      { x: '40%', delay: 300 },
      { x: '60%', delay: 600 },
      { x: '80%', delay: 900 },
    ];

    return (
      <Animated.View style={[{ position: 'absolute', width: '100%', height: '60%' }, animatedLeafFallStyle]}>
        {leaves.map((leaf, idx) => {
          const leafAnimStyle = useAnimatedStyle(() => {
            const yPosition = interpolate(
              leafFallProgress.value,
              [0, 1],
              [-30, 120],
              Extrapolate.CLAMP
            );
            const rotation = interpolate(
              leafFallProgress.value,
              [0, 1],
              [0, 360 + idx * 45],
              Extrapolate.CLAMP
            );
            return {
              transform: [
                { translateY: yPosition },
                { rotate: `${rotation}deg` },
              ],
            };
          });

          return (
            <Animated.View
              key={`leaf-${idx}`}
              style={[
                {
                  position: 'absolute',
                  left: leaf.x,
                  top: '-20%',
                  width: 24,
                  height: 24,
                  backgroundColor: '#228B22',
                  borderRadius: 12,
                  opacity: 0.8,
                },
                leafAnimStyle,
              ]}
            />
          );
        })}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Main Plant Area */}
      <View style={styles.plantContainer}>
        {/* Pot */}
        <View style={styles.pot}>
          <View style={styles.potTop} />
          <View style={styles.potBody} />
          <View style={styles.potBottom} />
        </View>

        {/* Plant */}
        <Animated.View style={[styles.plantWrapper, animatedPlantStyle]}>
          {renderPlant()}
        </Animated.View>

        {/* Water Drops */}
        {celebrateWater && <WaterDropAnimation />}

        {/* Falling Leaves (Reset Animation) */}
        {isReset && <FallingLeaves />}

        {/* Celebration Particles (Blossoming Stage) */}
        {plantStage === 'blossoming' && celebrateWater && (
          <View style={styles.celebrationParticles}>
            {[...Array(6)].map((_, i) => (
              <View
                key={`particle-${i}`}
                style={[
                  styles.particle,
                  {
                    left: `${15 + i * 12}%`,
                    backgroundColor: ['#FFB6C1', '#FFD700', '#FF69B4', '#FF6347'][i % 4],
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Day Counter */}
      <View style={styles.dayCounter}>
        <Text style={styles.dayText}>Day {dayNumber} of 75</Text>
        <View style={[styles.progressBar, { width: `${(dayNumber / 75) * 100}%` }]} />
      </View>

      {/* Motivational Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{getMotivationalMessage()}</Text>
      </View>

      {/* Task Completion Indicator */}
      <View style={styles.taskIndicator}>
        <Text style={styles.taskText}>Tasks Completed: {tasksCompleted}/5</Text>
        <View style={styles.taskDots}>
          {[...Array(5)].map((_, i) => (
            <View
              key={`task-${i}`}
              style={[
                styles.taskDot,
                { backgroundColor: i < tasksCompleted ? '#4CAF50' : '#CCCCCC' },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        {hasWatered && (
          <Text style={styles.instructionText}>✓ Plant watered! Keep completing tasks to help your plant grow 💧</Text>
        )}
        {isReset && (
          <Text style={styles.instructionText}>🍂 The plant has lost its leaves, but continue your journey to regrow them!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 248, 255, 0.6)',
  },
  plantContainer: {
    width: width * 0.8,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  plantWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 60,
  },
  pot: {
    width: 80,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#D2B48C',
    borderWidth: 2,
    borderColor: '#8B7355',
    position: 'absolute',
    bottom: 0,
  },
  potTop: {
    width: '100%',
    height: 12,
    backgroundColor: '#CD853F',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
  },
  potBody: {
    flex: 1,
    backgroundColor: '#D2B48C',
  },
  potBottom: {
    width: '100%',
    height: 8,
    backgroundColor: '#8B7355',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dayCounter: {
    width: '90%',
    marginVertical: 15,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    width: '100%',
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  taskIndicator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  taskText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  taskDots: {
    flexDirection: 'row',
    gap: 8,
  },
  taskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  celebrationParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '30%',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PlantGrowth;

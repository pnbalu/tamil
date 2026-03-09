import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COUNT = 50;
const COLORS = ['#C0392B', '#F4C430', '#2D7A4F', '#1A3A5C', '#E8731A', '#E8CBA0'];

export function Confetti() {
  const particles = useRef(
    Array.from({ length: COUNT }, () => {
      const startX = Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2;
      const driftX = (Math.random() - 0.5) * 120;
      return {
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        rotate: new Animated.Value(0),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 400,
        duration: 2800 + Math.random() * 1200,
        startX,
        driftX,
      };
    })
  ).current;

  useEffect(() => {
    const animations = particles.map((p) =>
      Animated.parallel([
        Animated.timing(p.translateX, {
          toValue: p.driftX,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.translateY, {
          toValue: SCREEN_HEIGHT + 30,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: p.duration * 0.35,
          delay: p.delay + p.duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();
  }, [particles]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '720deg'],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: SCREEN_WIDTH / 2 + p.startX - 8,
                top: -20,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.translateX },
                  { translateY: p.translateY },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});

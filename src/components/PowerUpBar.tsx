import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PowerUpState } from '../core/powerUps';

type Props = {
  powerUps: PowerUpState;
  onBomb: () => void;
  onColorBlast: () => void;
  onRotate: () => void;
  accentColor?: string;
};

function PowerUpBarComponent({ powerUps, onBomb, onColorBlast, onRotate, accentColor = '#a855f7' }: Props) {
  const hasAny = powerUps.bomb > 0 || powerUps.colorBlast > 0 || powerUps.rotate > 0;
  if (!hasAny) return null;

  return (
    <View style={styles.container}>
      {powerUps.bomb > 0 && (
        <Pressable style={[styles.btn, { borderColor: accentColor }]} onPress={onBomb} accessibilityRole="button" accessibilityLabel={`Bomb power-up, ${powerUps.bomb} available`}>
          <Text style={styles.icon}>💣</Text>
          <Text style={[styles.count, { color: accentColor }]}>{powerUps.bomb}</Text>
        </Pressable>
      )}
      {powerUps.colorBlast > 0 && (
        <Pressable style={[styles.btn, { borderColor: accentColor }]} onPress={onColorBlast} accessibilityRole="button" accessibilityLabel={`Color blast power-up, ${powerUps.colorBlast} available`}>
          <Text style={styles.icon}>🌈</Text>
          <Text style={[styles.count, { color: accentColor }]}>{powerUps.colorBlast}</Text>
        </Pressable>
      )}
      {powerUps.rotate > 0 && (
        <Pressable style={[styles.btn, { borderColor: accentColor }]} onPress={onRotate} accessibilityRole="button" accessibilityLabel={`Rotate power-up, ${powerUps.rotate} available`}>
          <Text style={styles.icon}>🔄</Text>
          <Text style={[styles.count, { color: accentColor }]}>{powerUps.rotate}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 6 },
  btn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 2 },
  icon: { fontSize: 18 },
  count: { fontSize: 14, fontWeight: '800', marginLeft: 4 },
});

export const PowerUpBar = React.memo(PowerUpBarComponent);

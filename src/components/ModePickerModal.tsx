import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { GameMode } from '../core/gameModes';

type Props = {
  visible: boolean;
  onSelect: (mode: GameMode) => void;
  onClose: () => void;
};

const MODES: { mode: GameMode; icon: string; name: string; desc: string }[] = [
  { mode: 'classic', icon: '🎮', name: 'Classic', desc: 'Standard gameplay — clear lines, get high score' },
  { mode: 'timed', icon: '⏱️', name: 'Timed (2 min)', desc: 'Race against the clock — score as much as you can' },
  { mode: 'zen', icon: '🧘', name: 'Zen', desc: 'No game over — relax and play endlessly' },
  { mode: 'obstacles', icon: '🧱', name: 'Obstacles', desc: 'Random blocks pre-placed — work around them' },
];

function ModePickerComponent({ visible, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.card}>
          <Text style={styles.title}>🎯 Game Modes</Text>
          {MODES.map((m) => (
            <Pressable key={m.mode} style={styles.row} onPress={() => onSelect(m.mode)} accessibilityRole="button">
              <Text style={styles.icon}>{m.icon}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.desc}>{m.desc}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: '#f8fafc', marginBottom: 8 },
  icon: { fontSize: 28, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  desc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  closeBtn: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  closeText: { color: '#64748b', fontWeight: '700', fontSize: 15 },
});

export const ModePickerModal = React.memo(ModePickerComponent);

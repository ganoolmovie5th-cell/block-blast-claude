import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { THEMES, Theme } from '../core/themes';

type Props = {
  visible: boolean;
  currentThemeId: string;
  highScore: number;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function ThemePickerComponent({ visible, currentThemeId, highScore, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.card}>
          <Text style={styles.title}>🎨 Themes</Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {THEMES.map((t) => {
              const locked = highScore < t.unlockScore;
              const active = t.id === currentThemeId;
              return (
                <Pressable
                  key={t.id}
                  style={[
                    styles.row,
                    active && styles.rowActive,
                    locked && styles.rowLocked,
                  ]}
                  onPress={() => !locked && onSelect(t.id)}
                  disabled={locked}
                  accessibilityRole="button"
                >
                  <View style={[styles.swatch, { backgroundColor: t.colors.accent }]} />
                  <View style={styles.info}>
                    <Text style={[styles.name, locked && styles.lockedText]}>
                      {t.name} {active ? '✓' : ''}
                    </Text>
                    {locked ? (
                      <Text style={styles.unlock}>🔒 Score {t.unlockScore}+ to unlock</Text>
                    ) : null}
                  </View>
                  <View style={[styles.preview, { backgroundColor: t.colors.bg }]}>
                    <View style={[styles.previewCell, { backgroundColor: t.colors.cellEmpty }]} />
                    <View style={[styles.previewCell, { backgroundColor: t.colors.boardBg }]} />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  list: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  rowActive: { borderWidth: 2, borderColor: '#a855f7' },
  rowLocked: { opacity: 0.5 },
  swatch: { width: 28, height: 28, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  lockedText: { color: '#94a3b8' },
  unlock: { fontSize: 11, color: '#64748b', marginTop: 2 },
  preview: { flexDirection: 'row', gap: 3, padding: 6, borderRadius: 8 },
  previewCell: { width: 14, height: 14, borderRadius: 4 },
  closeBtn: {
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export const ThemePicker = React.memo(ThemePickerComponent);

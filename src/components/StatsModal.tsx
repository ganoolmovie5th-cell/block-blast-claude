import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Stats, ACHIEVEMENTS } from '../core/achievements';

type Props = {
  visible: boolean;
  stats: Stats;
  unlockedAchievements: string[];
  streak: number;
  onClose: () => void;
};

function StatsModalComponent({ visible, stats, unlockedAchievements, streak, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.card}>
          <Text style={styles.title}>📊 Statistics</Text>

          <View style={styles.grid}>
            <StatBox label="Games" value={stats.gamesPlayed} />
            <StatBox label="Best Score" value={stats.bestScore} />
            <StatBox label="Lines Cleared" value={stats.totalLinesCleared} />
            <StatBox label="Best Combo" value={`x${stats.bestCombo}`} />
            <StatBox label="Max Lines/Move" value={stats.maxLinesOneMove} />
            <StatBox label="Streak" value={`${streak}🔥`} />
          </View>

          <Text style={styles.subTitle}>
            🏆 Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </Text>
          <ScrollView style={styles.achList} showsVerticalScrollIndicator={false}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <View key={a.id} style={[styles.achRow, !unlocked && styles.locked]}>
                  <Text style={styles.achIcon}>{unlocked ? a.icon : '🔒'}</Text>
                  <View style={styles.achInfo}>
                    <Text style={[styles.achName, !unlocked && styles.lockedText]}>{a.name}</Text>
                    <Text style={styles.achDesc}>{a.description}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, maxHeight: '80%' },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { width: '30%', alignItems: 'center', marginBottom: 12, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2 },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  achList: { maxHeight: 200, marginBottom: 16 },
  achRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  locked: { opacity: 0.4 },
  achIcon: { fontSize: 24, marginRight: 10 },
  achInfo: { flex: 1 },
  achName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  lockedText: { color: '#94a3b8' },
  achDesc: { fontSize: 11, color: '#64748b' },
  closeBtn: { backgroundColor: '#a855f7', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export const StatsModal = React.memo(StatsModalComponent);

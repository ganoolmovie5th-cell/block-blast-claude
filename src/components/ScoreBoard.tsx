import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  score: number;
  highScore: number;
  combo: number;
  canUndo: boolean;
  onUndo: () => void;
  textColor?: string;
  textSecondary?: string;
  accentColor?: string;
};

function ScoreBoardComponent({
  score,
  highScore,
  combo,
  canUndo,
  onUndo,
  textColor = '#1e293b',
  textSecondary = '#475569',
  accentColor = '#a855f7',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={[styles.label, { color: textSecondary }]}>SCORE</Text>
        <Text style={[styles.score, { color: textColor }]}>{score}</Text>
      </View>

      <View style={styles.center}>
        {combo > 1 ? (
          <View style={[styles.comboBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.comboText}>x{combo}</Text>
          </View>
        ) : null}
        {canUndo ? (
          <Pressable
            style={[styles.undoBtn, { borderColor: accentColor }]}
            onPress={onUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo last move"
          >
            <Text style={[styles.undoText, { color: accentColor }]}>↩ Undo</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.stat}>
        <Text style={[styles.label, { color: textSecondary }]}>BEST</Text>
        <Text style={[styles.high, { color: textSecondary }]}>{highScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  stat: { alignItems: 'center' },
  center: { alignItems: 'center', gap: 6 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  score: { fontSize: 34, fontWeight: '800' },
  high: { fontSize: 24, fontWeight: '700' },
  comboBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  comboText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
  },
  undoText: { fontWeight: '700', fontSize: 13 },
});

export const ScoreBoard = React.memo(ScoreBoardComponent);

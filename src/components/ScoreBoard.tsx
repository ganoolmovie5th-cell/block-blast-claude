import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  score: number;
  highScore: number;
  combo: number;
};

function ScoreBoardComponent({ score, highScore, combo }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      {combo > 1 ? (
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>COMBO x{combo}</Text>
        </View>
      ) : null}

      <View style={styles.stat}>
        <Text style={styles.label}>BEST</Text>
        <Text style={styles.high}>{highScore}</Text>
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
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', letterSpacing: 1 },
  score: { fontSize: 34, fontWeight: '800', color: '#1e293b' },
  high: { fontSize: 24, fontWeight: '700', color: '#475569' },
  comboBadge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  comboText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

export const ScoreBoard = React.memo(ScoreBoardComponent);

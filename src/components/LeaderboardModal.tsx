import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type LeaderboardEntry = {
  score: number;
  timestamp: number;
  gameMode: string;
};

interface LeaderboardModalProps {
  visible: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ visible, entries, onClose }) => {
  const sorted = entries.slice().sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Leaderboard</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {sorted.length === 0 ? (
              <Text style={styles.empty}>No scores yet. Play a game!</Text>
            ) : (
              sorted.map((entry, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.rank}>#{idx + 1}</Text>
                  <View style={styles.info}>
                    <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
                    <Text style={styles.mode}>{entry.gameMode}</Text>
                  </View>
                  <Text style={styles.time}>{new Date(entry.timestamp).toLocaleTimeString()}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    color: '#9ca3af',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rank: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0d9488',
    width: 40,
  },
  info: {
    flex: 1,
    marginLeft: 8,
  },
  score: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1f2937',
  },
  mode: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#d1d5db',
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: '#0d9488',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

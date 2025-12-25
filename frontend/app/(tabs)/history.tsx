import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAnswers, deleteAnswer } from '../../utils/storage';
import { formatDisplayDate, formatShortDate } from '../../utils/dateHelper';
import { Answer } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function HistoryScreen() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadAnswers();
    }, [])
  );

  const loadAnswers = async () => {
    try {
      const allAnswers = await getAllAnswers();
      // Sort by date descending (newest first)
      const sorted = allAnswers.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAnswers(sorted);
    } catch (error) {
      console.error('Error loading answers:', error);
      Alert.alert('Hata', 'Cevaplar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (answer: Answer) => {
    Alert.alert(
      'Sil',
      'Bu cevabı silmek istediğinden emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnswer(answer.date);
              setAnswers(prev => prev.filter(a => a.date !== answer.date));
              if (selectedAnswer?.date === answer.date) {
                setSelectedAnswer(null);
              }
            } catch (error) {
              Alert.alert('Hata', 'Cevap silinemedi.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Answer }) => (
    <TouchableOpacity
      style={[
        styles.answerItem,
        selectedAnswer?.date === item.date && styles.answerItemSelected,
      ]}
      onPress={() => setSelectedAnswer(selectedAnswer?.date === item.date ? null : item)}
      activeOpacity={0.7}
    >
      <View style={styles.answerHeader}>
        <View style={styles.dateCircle}>
          <Text style={styles.dateDay}>{formatShortDate(item.date)}</Text>
        </View>
        <View style={styles.answerContent}>
          <Text style={styles.questionText} numberOfLines={2}>
            {item.questionText}
          </Text>
          <Text style={styles.answerPreview} numberOfLines={2}>
            {item.answer}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {selectedAnswer?.date === item.date && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.expandedDate}>
            {formatDisplayDate(item.date)}
          </Text>
          <Text style={styles.expandedQuestion}>{item.questionText}</Text>
          <Text style={styles.expandedAnswer}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (answers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz bir cevabın yok</Text>
          <Text style={styles.emptyText}>
            Bugünün sorusuna cevap vererek başla!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={answers}
        renderItem={renderItem}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  answerItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  answerItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f8f9ff',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  answerContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  answerPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  expandedDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  expandedQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  expandedAnswer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
});

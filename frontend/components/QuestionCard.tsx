import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bugünün Sorusu</Text>
      <Text style={styles.questionText}>{question.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    lineHeight: 28,
  },
});

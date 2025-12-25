import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestionCard } from '../../components/QuestionCard';
import { AnswerInput } from '../../components/AnswerInput';
import { getTodayQuestion } from '../../utils/questions';
import { saveAnswer, getTodayAnswer } from '../../utils/storage';
import { formatDisplayDate, getTodayDateString } from '../../utils/dateHelper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [question] = useState(getTodayQuestion());
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    loadTodayAnswer();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Her ekrana geldiğinde veriyi yeniden yükle
      loadTodayAnswer();
    }, [])
  );

  const loadTodayAnswer = async () => {
    try {
      setLoading(true);
      const todayAnswer = await getTodayAnswer();
      if (todayAnswer) {
        setAnswer(todayAnswer.answer);
        setHasAnswered(true);
      } else {
        // Cevap yoksa temizle
        setAnswer('');
        setHasAnswered(false);
      }
    } catch (error) {
      console.error('Error loading today answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!answer.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir cevap yazın.');
      return;
    }

    setSaving(true);
    try {
      await saveAnswer(answer, question.id, question.text);
      setHasAnswered(true);
      Alert.alert(
        'Kaydedildi! ✓',
        'Cevabın başarıyla kaydedildi.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Cevap kaydedilemedi. Lütfen tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatDisplayDate(getTodayDateString())}
            </Text>
          </View>

          <QuestionCard question={question} />

          <AnswerInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Düşüncelerini buraya yaz..."
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {hasAnswered ? 'Güncelle' : 'Kaydet'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {hasAnswered && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.infoText}>
                Bugün için cevabını zaten kaydettin. Değişiklik yapabilirsin.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

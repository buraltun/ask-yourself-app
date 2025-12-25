import AsyncStorage from '@react-native-async-storage/async-storage';
import { Answer, NotificationSettings } from '../types';
import { getTodayDateString } from './dateHelper';

const ANSWERS_KEY = '@daily_journal_answers';
const SETTINGS_KEY = '@daily_journal_settings';

// Answer operations
export const saveAnswer = async (answer: string, questionId: number, questionText: string): Promise<void> => {
  try {
    const answers = await getAllAnswers();
    const todayDate = getTodayDateString();
    
    const newAnswer: Answer = {
      date: todayDate,
      questionId,
      questionText,
      answer,
      createdAt: Date.now(),
    };
    
    // Replace if exists for today, otherwise add
    const filteredAnswers = answers.filter(a => a.date !== todayDate);
    filteredAnswers.push(newAnswer);
    
    await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(filteredAnswers));
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};

export const getTodayAnswer = async (): Promise<Answer | null> => {
  try {
    const answers = await getAllAnswers();
    const todayDate = getTodayDateString();
    return answers.find(a => a.date === todayDate) || null;
  } catch (error) {
    console.error('Error getting today answer:', error);
    return null;
  }
};

export const getAllAnswers = async (): Promise<Answer[]> => {
  try {
    const data = await AsyncStorage.getItem(ANSWERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting all answers:', error);
    return [];
  }
};

export const deleteAnswer = async (date: string): Promise<void> => {
  try {
    const answers = await getAllAnswers();
    const filteredAnswers = answers.filter(a => a.date !== date);
    await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(filteredAnswers));
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

// Settings operations
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return { enabled: false, time: '20:00' };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting settings:', error);
    return { enabled: false, time: '20:00' };
  }
};

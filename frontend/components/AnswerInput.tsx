import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';

interface AnswerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({ 
  value, 
  onChangeText, 
  placeholder = 'Düşüncelerini buraya yaz...' 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        textAlignVertical="top"
        autoCorrect
        autoCapitalize="sentences"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { User } from '../types';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const { signIn, continueAsGuest } = useUser();
  const router = useRouter();

  const handleAppleSignIn = async () => {
    // Web'de Apple Sign In desteklenmediği için
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Sınırlaması',
        'Apple Sign In gerçek cihazda çalışır. Misafir olarak devam edebilirsin.',
        [{ text: 'Tamam' }]
      );
      return;
    }
    
    try {
      setLoading(true);
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const user: User = {
        id: credential.user,
        email: credential.email || null,
        fullName: credential.fullName 
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : null,
        isAnonymous: false,
      };

      await signIn(user);
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Hata', 'Giriş yapılamadı. Lütfen tekrar dene.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    try {
      setLoading(true);
      await continueAsGuest();
      // Use replace with timeout to ensure navigation works
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar dene.');
      setLoading(false);
    }
  };

  // Web'de Apple Sign In desteklenmediği için uyarı göster
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="journal" size={80} color="#007AFF" />
          </View>
          
          <Text style={styles.title}>Günlük Tek Soru</Text>
          <Text style={styles.subtitle}>
            Her gün sadece bir soru, sadece bir cevap.
            Düşüncelerini kaydet, kendini keşfet.
          </Text>

          <View style={styles.webNotice}>
            <Ionicons name="information-circle" size={24} color="#FF9500" />
            <Text style={styles.webNoticeText}>
              Apple Sign In gerçek cihazda çalışır. Web'de misafir olarak devam edebilirsin.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestContinue}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
                <Text style={styles.guestButtonText}>Misafir Olarak Devam Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="journal" size={80} color="#007AFF" />
        </View>
        
        <Text style={styles.title}>Günlük Tek Soru</Text>
        <Text style={styles.subtitle}>
          Her gün sadece bir soru, sadece bir cevap.
          Düşüncelerini kaydet, kendini keşfet.
        </Text>

        <View style={styles.buttonContainer}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestContinue}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
                <Text style={styles.guestButtonText}>Misafir Olarak Devam Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyText}>
          Verileriniz sadece cihazınızda saklanır.
          Gizliliğiniz bizim için önemlidir.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  guestButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  privacyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    marginBottom: 24,
  },
  webNoticeText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

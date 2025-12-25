import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getNotificationSettings, saveNotificationSettings } from '../../utils/storage';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelAllNotifications,
  testNotification,
  getScheduledNotifications,
} from '../../utils/notifications';
import { NotificationSettings } from '../../types';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '20:00',
  });
  const [loading, setLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const { user, signOut } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getNotificationSettings();
      setSettings(saved);
      
      // Parse time string to Date
      const [hours, minutes] = saved.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setSelectedTime(date);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Request permission first
      const hasPermission = await requestNotificationPermissions();
      
      if (!hasPermission) {
        Alert.alert(
          'İzin Gerekli',
          'Bildirimler için izin vermelisin. Lütfen ayarlardan bildirimlere izin ver.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Schedule notification
      const [hours, minutes] = settings.time.split(':').map(Number);
      const notificationId = await scheduleDailyNotification(hours, minutes);
      
      if (notificationId) {
        const newSettings = { ...settings, enabled: true };
        setSettings(newSettings);
        await saveNotificationSettings(newSettings);
        
        Alert.alert(
          '✅ Bildirimler Aktif',
          `Her gün saat ${settings.time} hatırlatma alacaksın.`,
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert(
          'Hata',
          'Bildirim ayarlanamadı. Lütfen tekrar dene.',
          [{ text: 'Tamam' }]
        );
      }
    } else {
      // Disable notifications
      await cancelAllNotifications();
      const newSettings = { ...settings, enabled: false };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);
      
      Alert.alert(
        'Bildirimler Kapatıldı',
        'Artık günlük hatırlatma almayacaksın.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const handleTimeSave = async () => {
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const newSettings = { ...settings, time: timeString };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    
    // If notifications are enabled, reschedule
    if (settings.enabled) {
      await scheduleDailyNotification(hours, minutes);
      Alert.alert(
        'Saat Güncellendi',
        `Yeni hatırlatma saati: ${timeString}`,
        [{ text: 'Tamam' }]
      );
    }
    
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    // Reset to saved time
    const [hours, minutes] = settings.time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setSelectedTime(date);
    setShowTimePicker(false);
  };

  const handleTestNotification = async () => {
    // Web'de bildirimler çalışmadığı için uyarı göster
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Sınırlaması',
        'Test bildirimi gerçek cihazda (Expo Go) çalışır. Web preview\'da bildirimler desteklenmez.\n\nGerçek cihazda test etmek için:\n1. Expo Go uygulamasını aç\n2. QR kodu tara\n3. Bu butona tekrar bas',
        [{ text: 'Anladım' }]
      );
      return;
    }
    
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        'İzin Gerekli',
        'Test bildirimi için izin vermelisin.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    await testNotification();
    Alert.alert(
      'Test Bildirimi Gönderildi',
      '2 saniye içinde bildirim alacaksın.',
      [{ text: 'Tamam' }]
    );
  };

  const showTimePickerModal = () => {
    setShowTimePicker(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Bildirimler</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Günlük Hatırlatma</Text>
              <Text style={styles.settingDescription}>
                Her gün belirlediğin saatte hatırlatma al
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E5E5EA"
            />
          </View>

          {settings.enabled && (
            <>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={showTimePickerModal}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Hatırlatma Saati</Text>
                  <Text style={styles.settingValue}>{settings.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.testButton]}
                onPress={handleTestNotification}
                activeOpacity={0.7}
              >
                <Ionicons name="flask" size={20} color="#007AFF" />
                <Text style={styles.testButtonText}>Test Bildirimi Gönder</Text>
              </TouchableOpacity>
            </>
          )}

          {showTimePicker && (
            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                textColor="#000000"
                themeVariant="light"
              />
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerCancelButton}
                  onPress={handleTimeCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timePickerCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerSaveButton}
                  onPress={handleTimeSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timePickerSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Profil</Text>
            </View>

            <View style={styles.profileInfo}>
              {user.isAnonymous ? (
                <>
                  <View style={styles.profileRow}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <Text style={styles.profileLabel}>Misafir Kullanıcı</Text>
                  </View>
                  <Text style={styles.profileDescription}>
                    Verileriniz sadece bu cihazda saklanıyor
                  </Text>
                </>
              ) : (
                <>
                  {user.fullName && (
                    <View style={styles.profileRow}>
                      <Ionicons name="person" size={20} color="#007AFF" />
                      <Text style={styles.profileValue}>{user.fullName}</Text>
                    </View>
                  )}
                  {user.email && (
                    <View style={styles.profileRow}>
                      <Ionicons name="mail" size={20} color="#007AFF" />
                      <Text style={styles.profileValue}>{user.email}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={async () => {
                Alert.alert(
                  'Çıkış Yap',
                  'Çıkış yapmak istediğinden emin misin? Verileriniz cihazda kalacak.',
                  [
                    { text: 'İptal', style: 'cancel' },
                    {
                      text: 'Çıkış Yap',
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                        router.replace('/auth');
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Hakkında</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Uygulama</Text>
            <Text style={styles.infoValue}>Günlük Tek Soru</Text>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Her gün sadece bir soru, sadece bir cevap. Düşüncelerini kaydet,
              geçmişine bak, kendini keşfet.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  settingValue: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  testButton: {
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    marginTop: 8,
    borderBottomWidth: 0,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  descriptionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  timePickerCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timePickerSaveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  timePickerSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    paddingVertical: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  profileValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  profileDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

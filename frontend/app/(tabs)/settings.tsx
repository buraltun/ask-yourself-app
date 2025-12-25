import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationSettings, saveNotificationSettings } from '../../utils/storage';
import { NotificationSettings } from '../../types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '20:00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getNotificationSettings();
      setSettings(saved);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    try {
      await saveNotificationSettings(newSettings);
      if (value) {
        Alert.alert(
          'Bildirimler Aktif',
          `Her gün saat ${settings.time} hatırlatma alacaksın.`,
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
    }
  };

  const handleTimeChange = () => {
    Alert.alert(
      'Bildirim Saati',
      'Bildirim saati özelliği yakında eklenecek!',
      [{ text: 'Tamam' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
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
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : '#fff'}
            />
          </View>

          {settings.enabled && (
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleTimeChange}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hatırlatma Saati</Text>
                <Text style={styles.settingValue}>{settings.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
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
});

import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, CreditCard, Sliders } from 'lucide-react-native';
import { Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';

import { Theme } from '../../constants/theme';

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggleLanguage = async () => {
    const nextLang = isArabic ? 'fr' : 'ar';
    const shouldBeRTL = nextLang === 'ar';
    await i18n.changeLanguage(nextLang);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.card,
          borderTopColor: Theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Theme.colors.card,
        },
        headerTitleStyle: {
          color: Theme.colors.textPrimary,
          fontSize: 16,
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langBtnText}>{isArabic ? 'FR' : 'دارجة'}</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="agenda"
        options={{
          title: t('tabs.agenda'),
          tabBarIcon: ({ color }) => <Calendar size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: t('tabs.clients'),
          tabBarIcon: ({ color }) => <Users size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="caisse"
        options={{
          title: t('tabs.caisse'),
          tabBarIcon: ({ color }) => <CreditCard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pitch"
        options={{
          title: t('tabs.pitch'),
          tabBarIcon: ({ color }) => <Sliders size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  langBtn: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Theme.colors.accent,
    borderRadius: 16,
  },
  langBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

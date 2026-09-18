import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, AlertTriangle, Camera, Sparkles } from 'lucide-react-native';

import { Theme } from '../../constants/theme';

const MOCK_CLIENT = {
  name: 'Meryem Bennani',
  phone: '06 61 23 45 67',
  visits: 14,
  points: 120,
  scalpAlert: 'Cuir chevelu sensible - éviter oxydant 30V direct',
  preferences: ['Thé à la menthe sans sucre', 'Préfère le silence', 'Toujours ponctuelle'],
  formulas: [
    {
      date: '20 Août 2026',
      brand: "L'Oréal Majirel",
      shade: '35g 7.1 + 15g 7.11 (Cendré intense)',
      developer: '20 Vol (6%)',
      time: '35 min',
      stylist: 'Fatima',
      before: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
      after: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
    },
  ],
};

export default function ClientsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBox}>
        <Search size={18} color={Theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('client.searchPlaceholder')}
          placeholderTextColor={Theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Client Header Card */}
        <View style={styles.clientCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>M</Text>
            </View>
            <View>
              <Text style={styles.clientTitle}>{MOCK_CLIENT.name}</Text>
              <Text style={styles.clientPhone}>{MOCK_CLIENT.phone}</Text>
            </View>
            <View style={styles.loyaltyBadge}>
              <Sparkles size={12} color="#000" />
              <Text style={styles.loyaltyText}>{MOCK_CLIENT.points} pts</Text>
            </View>
          </View>

          {/* Scalp Sensitivity Alert */}
          {MOCK_CLIENT.scalpAlert && (
            <View style={styles.alertBox}>
              <AlertTriangle size={16} color={Theme.colors.accentRose} />
              <Text style={styles.alertText}>{MOCK_CLIENT.scalpAlert}</Text>
            </View>
          )}

          {/* Personal Quirks & Preferences */}
          <View style={styles.tagWrap}>
            {MOCK_CLIENT.preferences.map((p, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>✨ {p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notebook Killer: Hair Formula Vault */}
        <Text style={styles.sectionTitle}>{t('client.formulaHistory')}</Text>

        {MOCK_CLIENT.formulas.map((f, i) => (
          <View key={i} style={styles.formulaCard}>
            <View style={styles.formulaHeader}>
              <Text style={styles.formulaDate}>{f.date}</Text>
              <Text style={styles.formulaStylist}>Par: {f.stylist}</Text>
            </View>

            <View style={styles.formulaRow}>
              <Text style={styles.formulaLabel}>Marque:</Text>
              <Text style={styles.formulaValue}>{f.brand}</Text>
            </View>

            <View style={styles.formulaRow}>
              <Text style={styles.formulaLabel}>Formule:</Text>
              <Text style={[styles.formulaValue, { color: Theme.colors.accent }]}>{f.shade}</Text>
            </View>

            <View style={styles.formulaGrid}>
              <View>
                <Text style={styles.formulaLabel}>{t('client.developer')}</Text>
                <Text style={styles.formulaValue}>{f.developer}</Text>
              </View>
              <View>
                <Text style={styles.formulaLabel}>{t('client.time')}</Text>
                <Text style={styles.formulaValue}>{f.time}</Text>
              </View>
            </View>

            {/* Before / After Photo Comparison */}
            <View style={styles.photosRow}>
              <View style={styles.photoCol}>
                <Image source={{ uri: f.before }} style={styles.photoImg} />
                <Text style={styles.photoCaption}>Avant</Text>
              </View>
              <View style={styles.photoCol}>
                <Image source={{ uri: f.after }} style={styles.photoImg} />
                <Text style={styles.photoCaption}>Après</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.cameraBtn}>
          <Camera size={18} color="#000" />
          <Text style={styles.cameraBtnText}>Enregistrer Formule & Photos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, margin: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, gap: 10 },
  searchInput: { flex: 1, height: 46, color: Theme.colors.textPrimary, fontSize: 14 },
  content: { flex: 1, paddingHorizontal: 16 },
  clientCard: { backgroundColor: Theme.colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2B271A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.accent },
  avatarLetter: { color: Theme.colors.accent, fontSize: 18, fontWeight: 'bold' },
  clientTitle: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  clientPhone: { color: Theme.colors.textMuted, fontSize: 12 },
  loyaltyBadge: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  loyaltyText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#331A1E', padding: 10, borderRadius: 8, marginTop: 12, gap: 8, borderWidth: 1, borderColor: Theme.colors.accentRose },
  alertText: { color: '#FECDD3', fontSize: 12, flex: 1 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { backgroundColor: '#24242B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: Theme.colors.textMuted, fontSize: 11 },
  sectionTitle: { color: Theme.colors.accent, fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  formulaCard: { backgroundColor: Theme.colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border, gap: 8, marginBottom: 16 },
  formulaHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingBottom: 8 },
  formulaDate: { color: Theme.colors.textPrimary, fontSize: 13, fontWeight: 'bold' },
  formulaStylist: { color: Theme.colors.textMuted, fontSize: 12 },
  formulaRow: { flexDirection: 'row', gap: 8 },
  formulaLabel: { color: Theme.colors.textMuted, fontSize: 12, width: 65 },
  formulaValue: { color: Theme.colors.textPrimary, fontSize: 13, flex: 1, fontWeight: '500' },
  formulaGrid: { flexDirection: 'row', gap: 40, marginTop: 4 },
  photosRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  photoCol: { flex: 1, alignItems: 'center' },
  photoImg: { width: '100%', height: 120, borderRadius: 8 },
  photoCaption: { color: Theme.colors.textMuted, fontSize: 11, marginTop: 4 },
  cameraBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.accent, padding: 14, borderRadius: 12, gap: 8, marginBottom: 30 },
  cameraBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});

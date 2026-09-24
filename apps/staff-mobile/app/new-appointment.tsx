import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react-native';

import { Theme } from '../constants/theme';
import {
  SALON_SERVICES,
  MOCK_STYLISTS,
  useAppointments,
} from '../mock/agendaData';
import { SalonService } from '../types/agenda';
import { BufferTimelinePreview } from '../components/BufferTimelinePreview';
import { ConcurrencyGuardAlert } from '../components/ConcurrencyGuardAlert';
import {
  calculateSlotTimeline,
  validateDoubleBooking,
  formatDurationHuman,
  parseTimeToMinutes,
  minutesToTimeString,
} from '../utils/bookingUtils';

const QUICK_TIMES = ['09:30', '10:00', '11:00', '12:00', '13:00', '15:00', '17:00'];
const VIP_CLIENTS = [
  { name: 'Fatine Ibrahimi', phone: '0661987654' },
  { name: 'Nawal El Fassi', phone: '0672345678' },
  { name: 'Leila Benmoussa', phone: '0663123456' },
];

export default function NewAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ stylistId?: string; time?: string; serviceId?: string }>();

  const { allAppointments, addAppointment } = useAppointments();

  // State
  const [selectedStylistId, setSelectedStylistId] = useState<string>(
    params.stylistId || '1'
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    params.serviceId || 'srv-coloration-racine'
  );
  const [startTime, setStartTime] = useState<string>(params.time || '10:00');
  const [clientName, setClientName] = useState<string>('Fatine Ibrahimi');
  const [clientPhone, setClientPhone] = useState<string>('0661987654');

  const selectedStylist = useMemo(
    () => MOCK_STYLISTS.find((s) => s.id === selectedStylistId) || MOCK_STYLISTS[0],
    [selectedStylistId]
  );

  const selectedService = useMemo(
    () => SALON_SERVICES.find((s) => s.id === selectedServiceId) || SALON_SERVICES[1],
    [selectedServiceId]
  );

  // Buffer calculation & timeline preview data
  const timeline = useMemo(() => {
    return calculateSlotTimeline(
      startTime,
      selectedService.durationMinutes,
      selectedService.bufferMinutes
    );
  }, [startTime, selectedService]);

  // Concurrency / Double-Booking Guard
  const validation = useMemo(() => {
    return validateDoubleBooking({
      stylistId: selectedStylistId,
      startTime,
      durationMinutes: selectedService.durationMinutes,
      bufferMinutes: selectedService.bufferMinutes,
      appointments: allAppointments,
      stylist: selectedStylist,
    });
  }, [selectedStylistId, startTime, selectedService, allAppointments, selectedStylist]);

  // Handle Stepper (+/- 15 mins)
  const adjustTime = (deltaMinutes: number) => {
    const currentMin = parseTimeToMinutes(startTime);
    const newMin = Math.max(9 * 60, Math.min(19 * 60 + 30, currentMin + deltaMinutes));
    setStartTime(minutesToTimeString(newMin));
  };

  // Submit Handler
  const handleConfirmBooking = () => {
    if (!validation.isValid) {
      Alert.alert('Réservation impossible', validation.message);
      return;
    }

    if (!clientName.trim()) {
      Alert.alert('Information manquante', 'Veuillez saisir le nom de la cliente.');
      return;
    }

    // Add appointment to shared store
    addAppointment({
      stylistId: selectedStylist.id,
      client: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      service: selectedService.name,
      serviceId: selectedService.id,
      startTime: timeline.startTime,
      endTime: timeline.endTime,
      buffer: selectedService.bufferMinutes.toString(),
      bufferEndTime: timeline.bufferEndTime,
      price: selectedService.priceFormatted,
      status: 'CONFIRMED',
    });

    // Close modal and return to calendar
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityLabel="Fermer"
        >
          <ChevronLeft size={22} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nouveau Rendez-vous</Text>
          <Text style={styles.headerSubtitle}>
            Réservation avec buffer de sécurité & garde anti-collision
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeCrossBtn}>
          <X size={20} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Stylist Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Coiffeuse / Styliste</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stylistList}
          >
            {MOCK_STYLISTS.map((stylist) => {
              const isSelected = stylist.id === selectedStylistId;
              return (
                <TouchableOpacity
                  key={stylist.id}
                  style={[
                    styles.stylistCard,
                    isSelected && styles.stylistCardActive,
                    stylist.isDayOff && styles.stylistCardDayOff,
                  ]}
                  onPress={() => setSelectedStylistId(stylist.id)}
                >
                  <Image source={{ uri: stylist.avatar }} style={styles.stylistAvatar} />
                  <View style={styles.stylistInfo}>
                    <Text
                      style={[
                        styles.stylistName,
                        isSelected && styles.stylistNameActive,
                      ]}
                    >
                      {stylist.name}
                    </Text>
                    <Text style={styles.stylistRole}>
                      {stylist.isDayOff ? '⚠️ En congé' : stylist.role}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkedCircle}>
                      <Check size={12} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. Service Catalog (Predefined Durations and Required Buffers) */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>2. Catalogue Prestations & Buffers</Text>
            <Text style={styles.catalogSubtitle}>Buffers calculés automatiquement</Text>
          </View>

          <View style={styles.serviceCatalogGrid}>
            {SALON_SERVICES.map((srv) => {
              const isSelected = srv.id === selectedServiceId;
              return (
                <TouchableOpacity
                  key={srv.id}
                  style={[
                    styles.serviceCard,
                    isSelected && styles.serviceCardActive,
                  ]}
                  onPress={() => setSelectedServiceId(srv.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceHeaderRow}>
                    <View style={styles.serviceNameGroup}>
                      <Text
                        style={[
                          styles.serviceName,
                          isSelected && styles.serviceNameActive,
                        ]}
                      >
                        {srv.name}
                      </Text>
                      {srv.isChemical && (
                        <View style={styles.chemicalTag}>
                          <FlaskConical size={11} color="#FBBF24" />
                          <Text style={styles.chemicalTagText}>Chimique</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.servicePrice}>{srv.priceFormatted}</Text>
                  </View>

                  <Text style={styles.serviceDesc}>{srv.description}</Text>

                  {/* Duration + Buffer Breakdown Badges */}
                  <View style={styles.serviceSpecsRow}>
                    <View style={styles.specPillDuration}>
                      <Clock size={12} color="#E4E4E7" />
                      <Text style={styles.specPillText}>
                        {formatDurationHuman(srv.durationMinutes)}
                      </Text>
                    </View>

                    <Text style={styles.plusSign}>+</Text>

                    <View style={styles.specPillBuffer}>
                      <ShieldCheck size={12} color="#93C5FD" />
                      <Text style={styles.specPillBufferText}>
                        +{srv.bufferMinutes} min buffer
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Slot / Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Heure de début</Text>
          
          {/* Quick pick chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeChipsScroll}
          >
            {QUICK_TIMES.map((time) => {
              const isSelected = time === startTime;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeChip,
                    isSelected && styles.timeChipActive,
                  ]}
                  onPress={() => setStartTime(time)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected && styles.timeChipTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stepper Buttons for custom fine-tuning */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustTime(-15)}
            >
              <Text style={styles.stepperBtnText}>-15 min</Text>
            </TouchableOpacity>

            <View style={styles.timeDisplayBox}>
              <Clock size={16} color={Theme.colors.accent} />
              <Text style={styles.timeDisplayText}>{startTime}</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustTime(15)}
            >
              <Text style={styles.stepperBtnText}>+15 min</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Buffer Timeline Preview Component */}
        <View style={styles.section}>
          <BufferTimelinePreview startTime={startTime} service={selectedService} />
        </View>

        {/* 5. Concurrency / Double-Booking Guard Live Warning */}
        <View style={styles.section}>
          <ConcurrencyGuardAlert
            validation={validation}
            onSelectNextFreeSlot={(slot) => setStartTime(slot)}
            stylistName={selectedStylist.name}
          />
        </View>

        {/* 6. Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Fiche Cliente</Text>

          {/* VIP Quick Picks */}
          <View style={styles.vipPickRow}>
            {VIP_CLIENTS.map((vip) => (
              <TouchableOpacity
                key={vip.name}
                style={[
                  styles.vipChip,
                  clientName === vip.name && styles.vipChipActive,
                ]}
                onPress={() => {
                  setClientName(vip.name);
                  setClientPhone(vip.phone);
                }}
              >
                <Text
                  style={[
                    styles.vipChipText,
                    clientName === vip.name && styles.vipChipTextActive,
                  ]}
                >
                  {vip.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputWrapper}>
            <User size={16} color={Theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nom complet de la cliente..."
              placeholderTextColor="#52525B"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Phone size={16} color={Theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="Téléphone (ex: 0661234567)"
              placeholderTextColor="#52525B"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Bottom Booking Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !validation.isValid && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={!validation.isValid}
            activeOpacity={0.8}
          >
            <Sparkles size={18} color={validation.isValid ? '#000' : '#71717A'} />
            <Text
              style={[
                styles.confirmButtonText,
                !validation.isValid && styles.confirmButtonTextDisabled,
              ]}
            >
              {validation.isValid
                ? `Confirmer le RDV (${selectedService.priceFormatted})`
                : 'Créneau indisponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#222228',
    marginRight: 10,
  },
  closeCrossBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  catalogSubtitle: {
    color: Theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  stylistList: {
    gap: 10,
    paddingRight: 10,
  },
  stylistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 10,
  },
  stylistCardActive: {
    borderColor: Theme.colors.accent,
    backgroundColor: '#262217',
  },
  stylistCardDayOff: {
    opacity: 0.6,
    borderColor: '#7F1D1D',
  },
  stylistAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  stylistInfo: {
    justifyContent: 'center',
  },
  stylistName: {
    color: Theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  stylistNameActive: {
    color: Theme.colors.accent,
  },
  stylistRole: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  checkedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  serviceCatalogGrid: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  serviceCardActive: {
    borderColor: Theme.colors.accent,
    backgroundColor: '#242017',
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serviceName: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  serviceNameActive: {
    color: Theme.colors.accent,
  },
  chemicalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  chemicalTagText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '600',
  },
  servicePrice: {
    color: Theme.colors.accent,
    fontSize: 15,
    fontWeight: 'bold',
  },
  serviceDesc: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  serviceSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specPillDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272730',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  specPillText: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '600',
  },
  plusSign: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
  },
  specPillBuffer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  specPillBufferText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  timeChipsScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  timeChip: {
    backgroundColor: '#202026',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timeChipActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  timeChipText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  stepperBtn: {
    backgroundColor: '#262630',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  stepperBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  timeDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A22',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  timeDisplayText: {
    color: Theme.colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  vipPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  vipChip: {
    backgroundColor: '#202026',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  vipChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Theme.colors.accent,
  },
  vipChipText: {
    color: Theme.colors.textMuted,
    fontSize: 11,
  },
  vipChipTextActive: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
  actionContainer: {
    marginTop: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.accent,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#2A2A32',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmButtonTextDisabled: {
    color: '#71717A',
  },
});

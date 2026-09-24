import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

import {
  SALON_SERVICES,
  MOCK_STYLISTS,
  useAppointments,
} from '../mock/agendaData';
import {
  calculateSlotTimeline,
  validateDoubleBooking,
  parseTimeToMinutes,
  minutesToTimeString,
} from '../utils/bookingUtils';
import { BufferTimelinePreview } from '../components/BufferTimelinePreview';
import { ConcurrencyGuardAlert } from '../components/ConcurrencyGuardAlert';
import {
  BookingHeader,
  StylistPicker,
  ServiceCatalogPicker,
  TimeSlotPicker,
  ClientInfoForm,
} from '../components/booking';
import { styles } from '../styles/newAppointment.styles';

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

  // Screen State
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

  // Stepper Handler (+/- 15 mins)
  const handleAdjustTime = (deltaMinutes: number) => {
    const currentMin = parseTimeToMinutes(startTime);
    const newMin = Math.max(9 * 60, Math.min(19 * 60 + 30, currentMin + deltaMinutes));
    setStartTime(minutesToTimeString(newMin));
  };

  // VIP Quick-select Handler
  const handleSelectVip = (vip: { name: string; phone: string }) => {
    setClientName(vip.name);
    setClientPhone(vip.phone);
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

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <BookingHeader onClose={() => router.back()} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Stylist Selection */}
        <StylistPicker
          stylists={MOCK_STYLISTS}
          selectedStylistId={selectedStylistId}
          onSelectStylist={setSelectedStylistId}
        />

        {/* 3. Predefined Service Catalog with Required Buffers */}
        <ServiceCatalogPicker
          services={SALON_SERVICES}
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
        />

        {/* 4. Start Time Selection & Stepper */}
        <TimeSlotPicker
          startTime={startTime}
          quickTimes={QUICK_TIMES}
          onSelectTime={setStartTime}
          onAdjustTime={handleAdjustTime}
        />

        {/* 5. Visual Buffer Timeline Preview */}
        <View style={styles.section}>
          <BufferTimelinePreview startTime={startTime} service={selectedService} />
        </View>

        {/* 6. Concurrency / Double-Booking Guard Warning */}
        <View style={styles.section}>
          <ConcurrencyGuardAlert
            validation={validation}
            onSelectNextFreeSlot={(slot) => setStartTime(slot)}
            stylistName={selectedStylist.name}
          />
        </View>

        {/* 7. Client Information Form */}
        <ClientInfoForm
          clientName={clientName}
          clientPhone={clientPhone}
          onChangeName={setClientName}
          onChangePhone={setClientPhone}
          vipClients={VIP_CLIENTS}
          onSelectVip={handleSelectVip}
        />

        {/* 8. Booking Confirmation Action */}
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

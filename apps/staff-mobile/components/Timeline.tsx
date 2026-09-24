import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { parse, differenceInMinutes, startOfDay, format } from 'date-fns';
import { Theme } from '@/constants/theme';
import { AppointmentBlock } from '@/components/AppointmentBlock';
import { TimelineProps } from '@/types/agenda';

const START_HOUR = 9;
const END_HOUR = 20;
const HOUR_HEIGHT = 80;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export const Timeline = ({ appointments = [], stylist }: TimelineProps) => {
  const router = useRouter();

  const handleEmptySlotPress = (hour: number, minute: number) => {
    if (!stylist) return;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    router.push(`/new-appointment?stylistId=${stylist.id}&time=${time}&date=${dateStr}`);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.timelineWrapper}>
        {/* Time Labels & Grid Lines */}
        <View style={styles.timeAxis}>
          {hours.map((hour) => (
            <View key={hour} style={[styles.hourRow, { height: hour === END_HOUR ? 0 : HOUR_HEIGHT }]}>
              <Text style={styles.timeLabel}>{hour}:00</Text>
              <View style={styles.gridLine} />
              
              {/* Invisible clickable slots for each 15 min */}
              {hour < END_HOUR && (
                <View style={styles.slotGrid}>
                  {[0, 15, 30, 45].map((min) => (
                    <TouchableOpacity 
                      key={`${hour}-${min}`} 
                      style={styles.slotDropzone} 
                      onPress={() => handleEmptySlotPress(hour, min)} 
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Appointment Blocks overlay */}
        <View style={styles.appointmentsOverlay}>
          {appointments.map((apt) => {
            const today = startOfDay(new Date());
            const startDt = parse(apt.startTime, 'HH:mm', today);
            const endDt = parse(apt.endTime, 'HH:mm', today);
            const dayStartDt = parse(`${START_HOUR}:00`, 'HH:mm', today);

            const startMinutesFrom9 = differenceInMinutes(startDt, dayStartDt);
            const endMinutesFrom9 = differenceInMinutes(endDt, dayStartDt);
            
            const top = startMinutesFrom9 * MINUTE_HEIGHT;
            const height = (endMinutesFrom9 - startMinutesFrom9) * MINUTE_HEIGHT;

            return (
              <AppointmentBlock 
                key={apt.id} 
                appointment={apt} 
                top={top} 
                height={height} 
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  timelineWrapper: {
    position: 'relative',
    marginTop: 10,
  },
  timeAxis: {
    width: '100%',
  },
  hourRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  timeLabel: {
    width: 50,
    textAlign: 'center',
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: -8, // Center vertically on the line
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  slotGrid: {
    position: 'absolute',
    top: 0,
    left: 50,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  slotDropzone: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  appointmentsOverlay: {
    position: 'absolute',
    top: 0,
    left: 50, // Right of the time label
    right: 16, // Padding right
    bottom: 0,
  },
});

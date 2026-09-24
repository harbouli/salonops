import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Theme } from '../../constants/theme';
import { styles } from '../../styles/newAppointment.styles';

interface TimeSlotPickerProps {
  startTime: string;
  quickTimes: string[];
  onSelectTime: (time: string) => void;
  onAdjustTime: (deltaMinutes: number) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  startTime,
  quickTimes,
  onSelectTime,
  onAdjustTime,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Heure de début</Text>

      {/* Quick pick chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeChipsScroll}
      >
        {quickTimes.map((time) => {
          const isSelected = time === startTime;
          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeChip,
                isSelected && styles.timeChipActive,
              ]}
              onPress={() => onSelectTime(time)}
              activeOpacity={0.8}
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
          onPress={() => onAdjustTime(-15)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepperBtnText}>-15 min</Text>
        </TouchableOpacity>

        <View style={styles.timeDisplayBox}>
          <Clock size={16} color={Theme.colors.accent} />
          <Text style={styles.timeDisplayText}>{startTime}</Text>
        </View>

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onAdjustTime(15)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepperBtnText}>+15 min</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

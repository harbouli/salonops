import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { Stylist } from '../../types/agenda';
import { styles } from '../../styles/newAppointment.styles';

interface StylistPickerProps {
  stylists: Stylist[];
  selectedStylistId: string;
  onSelectStylist: (id: string) => void;
}

export const StylistPicker: React.FC<StylistPickerProps> = ({
  stylists,
  selectedStylistId,
  onSelectStylist,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Coiffeuse / Styliste</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stylistList}
      >
        {stylists.map((stylist) => {
          const isSelected = stylist.id === selectedStylistId;
          return (
            <TouchableOpacity
              key={stylist.id}
              style={[
                styles.stylistCard,
                isSelected && styles.stylistCardActive,
                stylist.isDayOff && styles.stylistCardDayOff,
              ]}
              onPress={() => onSelectStylist(stylist.id)}
              activeOpacity={0.8}
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
  );
};

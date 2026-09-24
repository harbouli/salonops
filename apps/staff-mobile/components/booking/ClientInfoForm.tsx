import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { User, Phone } from 'lucide-react-native';
import { Theme } from '../../constants/theme';
import { styles } from '../../styles/newAppointment.styles';

interface VipClient {
  name: string;
  phone: string;
}

interface ClientInfoFormProps {
  clientName: string;
  clientPhone: string;
  onChangeName: (name: string) => void;
  onChangePhone: (phone: string) => void;
  vipClients: VipClient[];
  onSelectVip: (vip: VipClient) => void;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientName,
  clientPhone,
  onChangeName,
  onChangePhone,
  vipClients,
  onSelectVip,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. Fiche Cliente</Text>

      {/* VIP Quick Picks */}
      <View style={styles.vipPickRow}>
        {vipClients.map((vip) => (
          <TouchableOpacity
            key={vip.name}
            style={[
              styles.vipChip,
              clientName === vip.name && styles.vipChipActive,
            ]}
            onPress={() => onSelectVip(vip)}
            activeOpacity={0.7}
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
          onChangeText={onChangeName}
          placeholder="Nom complet de la cliente..."
          placeholderTextColor="#52525B"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Phone size={16} color={Theme.colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={clientPhone}
          onChangeText={onChangePhone}
          placeholder="Téléphone (ex: 0661234567)"
          placeholderTextColor="#52525B"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
};

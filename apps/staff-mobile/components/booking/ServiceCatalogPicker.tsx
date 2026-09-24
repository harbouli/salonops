import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, ShieldCheck, FlaskConical } from 'lucide-react-native';
import { SalonService } from '../../types/agenda';
import { formatDurationHuman } from '../../utils/bookingUtils';
import { styles } from '../../styles/newAppointment.styles';

interface ServiceCatalogPickerProps {
  services: SalonService[];
  selectedServiceId: string;
  onSelectService: (id: string) => void;
}

export const ServiceCatalogPicker: React.FC<ServiceCatalogPickerProps> = ({
  services,
  selectedServiceId,
  onSelectService,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>2. Catalogue Prestations & Buffers</Text>
        <Text style={styles.catalogSubtitle}>Buffers calculés automatiquement</Text>
      </View>

      <View style={styles.serviceCatalogGrid}>
        {services.map((srv) => {
          const isSelected = srv.id === selectedServiceId;
          return (
            <TouchableOpacity
              key={srv.id}
              style={[
                styles.serviceCard,
                isSelected && styles.serviceCardActive,
              ]}
              onPress={() => onSelectService(srv.id)}
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
  );
};

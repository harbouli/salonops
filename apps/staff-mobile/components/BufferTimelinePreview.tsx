import React from 'react';
import { View, Text } from 'react-native';
import { Clock, ShieldCheck, Sparkles, FlaskConical } from 'lucide-react-native';
import { Theme } from '../constants/theme';
import { SalonService } from '../types/agenda';
import { calculateSlotTimeline, formatDurationHuman } from '../utils/bookingUtils';
import { styles } from '../styles/bufferTimelinePreview.styles';

interface BufferTimelinePreviewProps {
  startTime: string;
  service: SalonService;
}

export const BufferTimelinePreview: React.FC<BufferTimelinePreviewProps> = ({ startTime, service }) => {
  const timeline = calculateSlotTimeline(startTime, service.durationMinutes, service.bufferMinutes);

  const totalMin = service.durationMinutes + service.bufferMinutes;
  const serviceFlex = service.durationMinutes;
  const bufferFlex = service.bufferMinutes;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Clock size={16} color={Theme.colors.accent} />
          <Text style={styles.title}>Buffer Timeline Preview</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>Total : {formatDurationHuman(totalMin)}</Text>
        </View>
      </View>

      {/* Visual Dual-Segment Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarContainer}>
          {/* Segment 1: Service Duration */}
          <View style={[styles.serviceSegment, { flex: serviceFlex }]}>
            <Sparkles size={12} color="#000" style={styles.segmentIcon} />
            <Text style={styles.serviceSegmentText} numberOfLines={1}>
              {timeline.startTime} - {timeline.endTime}
            </Text>
          </View>

          {/* Segment 2: Buffer Time */}
          <View style={[styles.bufferSegment, { flex: bufferFlex }]}>
            <ShieldCheck size={12} color="#93C5FD" style={styles.segmentIcon} />
            <Text style={styles.bufferSegmentText} numberOfLines={1}>
              Buffer +{service.bufferMinutes}m
            </Text>
          </View>
        </View>

        {/* Labels under the progress bar */}
        <View style={styles.barLegendRow}>
          <Text style={styles.legendService}>
            Prestation ({formatDurationHuman(service.durationMinutes)})
          </Text>
          <Text style={styles.legendBuffer}>
            Buffer ({service.bufferMinutes} min)
          </Text>
        </View>
      </View>

      {/* Exact Visual Breakdown Strip requested by Guide */}
      <View style={styles.formulaContainer}>
        <View style={styles.formulaBadgeService}>
          <Text style={styles.formulaTextService}>
            [Service: {timeline.startTime} - {timeline.endTime}]
          </Text>
        </View>

        <Text style={styles.formulaOperator}>+</Text>

        <View style={styles.formulaBadgeBuffer}>
          <Text style={styles.formulaTextBuffer}>
            [Buffer: {timeline.endTime} - {timeline.bufferEndTime}]
          </Text>
        </View>

        <Text style={styles.formulaOperator}>=</Text>

        <View style={styles.formulaBadgeResult}>
          <Text style={styles.formulaTextResult}>
            Next free slot at {timeline.nextFreeSlot}
          </Text>
        </View>
      </View>

      {/* Chemical Treatment Automatic Buffer Guarantee */}
      {service.isChemical && (
        <View style={styles.chemicalCallout}>
          <FlaskConical size={14} color="#FBBF24" />
          <Text style={styles.chemicalCalloutText}>
            Traitement chimique : Buffer de {service.bufferMinutes} min automatiquement réservé pour rinçage & stérilisation.
          </Text>
        </View>
      )}
    </View>
  );
};

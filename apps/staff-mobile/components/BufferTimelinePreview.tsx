import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, ShieldCheck, Sparkles, FlaskConical } from 'lucide-react-native';
import { Theme } from '../constants/theme';
import { SalonService } from '../types/agenda';
import { calculateSlotTimeline, formatDurationHuman } from '../utils/bookingUtils';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  totalBadge: {
    backgroundColor: '#2A2A34',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  totalBadgeText: {
    color: Theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarWrapper: {
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    backgroundColor: '#16161A',
  },
  serviceSegment: {
    backgroundColor: Theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#121214',
  },
  serviceSegmentText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bufferSegment: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  bufferSegmentText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  segmentIcon: {
    marginRight: 4,
  },
  barLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  legendService: {
    color: Theme.colors.accent,
    fontSize: 11,
    fontWeight: '500',
  },
  legendBuffer: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '500',
  },
  formulaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141418',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#26262F',
  },
  formulaBadgeService: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  formulaTextService: {
    color: Theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  formulaOperator: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
  },
  formulaBadgeBuffer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  formulaTextBuffer: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  formulaBadgeResult: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  formulaTextResult: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chemicalCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  chemicalCalloutText: {
    color: '#FDE68A',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
});

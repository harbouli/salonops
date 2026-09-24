import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  // Screen & Scroll Layout
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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

  // Header Component
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

  // Stylist Picker
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

  // Service Catalog Picker
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

  // Time Slot & Stepper Picker
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

  // Client Info Form
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

  // Action / Confirmation Button
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

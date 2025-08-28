import { StyleSheet } from 'react-native';

const CARD_WIDTH = 220;
const CARD_MARGIN = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
  },
  headerTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    height: 330,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
  },
  eventCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventContent: {
    padding: 12,
  },
  eventImageContainer: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FEE2E2',
  },
  dateOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dateMonth: {
    fontSize: 10,
    color: '#6B7280',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  eventRowScroll: {
    paddingBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: 4,
  },
  avatar: {
    width: 23,
    height: 23,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  participantsText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20, // 🔁 change from 250 to 20
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3557FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10, // ✅ makes sure it's above other content
  },
  plusIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 50,
  },

  // Event Detail Styles
  detailScrollView: {
    flex: 1,
  },
  detailImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    position: 'relative',
  },

  favoriteBtnOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  detailInfoContainer: {
    marginBottom: 24,
  },
  detailInfoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  detailInfoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailInfoIcon: {
    fontSize: 20,
  },
  detailInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  detailInfoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailSectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  readMoreLink: {
    fontSize: 14,
    color: '#3557FF',
    marginTop: 4,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  guidelineBullet: {
    fontSize: 18,
    color: '#3557FF',
    marginRight: 8,
    lineHeight: 20,
  },
  guidelineText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  placeholderText: {
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 120,
  },

  // Additional styles for responsive layout
  modalBackButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3557FF',
  },

  noEventsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  classnavgrade: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  classnavsection: {
    flexDirection: 'row',
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  gradeselection: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginLeft: 10,
    marginTop: 20,
    width: 90,
    borderRadius: 30,
    alignItems: 'center',
  },
  gradeselectiontext: {
    color: 'black',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#0C36FF',
  },
  activeText: {
    color: 'white',
  },

  //Event Details
  imageCurve: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // eventImage: {
  //   width: '100%',
  //   height: '100%',
  // },
  detailTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  innerscroll: {
    flex: 1,
  },
  aboutContainer: {
    // paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#120D26',
  },
  readMoreText: {
    fontSize: 14,
    color: '#4F70FD',
    marginTop: 4,
  },

  guidelinesContainer: {
    marginTop: 24,
    paddingHorizontal: 2,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  guidelineSection: {
    marginBottom: 16,
  },
  guidelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diamondBullet: {
    width: 10,
    height: 10,
    backgroundColor: '#5669FF',
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  guidelineSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  guidelineItems: {
    paddingLeft: 18,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#120D26',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 6,
  },
  registerButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flex: 1
  },

});

export default styles;

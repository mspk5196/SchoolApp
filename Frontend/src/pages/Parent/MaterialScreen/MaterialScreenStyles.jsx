import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
    paddingBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerText: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  languageScrollContainer: {
    flexGrow: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 20,
  },
  languageButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#EFEFF4',
  },
  selectedLanguage: {
    backgroundColor: '#3557FF',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  mainScrollView: {
    flex: 1, 
  },
  timeline: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  levelContainer: {
    marginBottom: 4,
  },
  levelHeaderContainer: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeLevelBadge: {
    backgroundColor: '#3557FF',
  },
  inactiveLevelBadge: {
    backgroundColor: '#C7C7CC',
  },
  levelNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  LevelText: {
    color: '#FFFFFF',
  },
  completedLevelBadge: {
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedTimelineLine: {
    backgroundColor: '#4CAF50', 
  },
  activeLevelBadge: {
    backgroundColor: '#3F51B5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveLevelBadge: {
    backgroundColor: '#E0E0E0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    top: 30,
    left: 14,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#C7C7CC',
  },
  levelContentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  tabsCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 44,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  activeTab: {
    backgroundColor: '#3557FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 13,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    paddingVertical: 5,
  },
  pdfIconContainer: {
    marginRight: 12,
  },
  pdfName: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
  },
  
  emptyStateText: {
    textAlign: 'center',
    color: '#8E8E93',
    padding: 16,
  },
  bottomNav: {
    height: 56,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#3478F6',
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeNavText: {
    color: '#3478F6',
    fontSize: 12,
    marginTop: 4,
  },
});

export default styles;
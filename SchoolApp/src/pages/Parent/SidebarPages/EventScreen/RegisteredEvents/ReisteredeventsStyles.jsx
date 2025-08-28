import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  image:{
    position: 'absolute',
    paddingLeft: 290,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 50,

  },

  eventTitleContainer: {
    paddingHorizontal: 20,
    height: 120,
    justifyContent: 'center',
    marginTop: 8,
  },
  eventTitle: {
    fontSize: 24,
    maxWidth: '60%',
    position: 'relative',
    fontWeight: 'bold',
    color: '#000',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#4F70FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationIconContainer: {
    backgroundColor: '#5E60CE',
  },
  icon: {
    color: '#FFF',
  },
  detailTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  innerscroll:{
    flex: 1,
  },
  aboutContainer: {
    paddingHorizontal: 20,
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
    fontWeight:'500',
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
    paddingHorizontal: 24,
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
    transform: [{rotate: '45deg'}],
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


  },
});

export default styles;

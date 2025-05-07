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
    backgroundColor: '#FAFAFA',
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
  categorySection: {
    marginBottom: 10,
    marginLeft: 10,
  },
  categoryTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    marginLeft: 6,
  },
  eventList: {
    marginBottom: 5,
    paddingLeft: 6,
    paddingRight: 8,
  },
  likedContainer: {
    position: 'absolute',
    right: 16,
    top: 8,
  },
  card: {
    width: 240,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  cardContent: {
    position: 'relative',
  },
  cardImage: {
    // width: '100%',
    margin:6,
    borderRadius: 12,
    height: 140,
    backgroundColor: '#FFD7D0',
  },
  dateTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#C2C2C2',
    borderRadius: 8,
    padding: 4,
    zIndex: 1,
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF3B30',
  },
  dateMonth: {
    fontSize: 10,
    textAlign: 'center',
    color: '#FF3B30',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContent: {
    padding: 12,
  },
  cardTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarOffset: {
    marginLeft: -10,
  },
  avatarOffset2: {
    marginLeft: -10,
  },
  participantsText: {
    fontSize: 12,
    color: '#3F38DD',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#2B2849',
    marginLeft: 4,
  },
});

export default styles;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import Arrow from    '../../../../assets/MentorPage/arrow.svg';
import Checkbox from '../../../../assets/MentorPage/checkbox2.svg';
import Pencil from   '../../../../assets/MentorPage/edit.svg';
import styles from './Academicssty';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const createProfile = (name, id) => ({
  name,
  id,
  image: require('../../../../assets/MentorPage/profile.png'),
  feedback: '',
});

const level1Profiles = Array(4)
  .fill()
  .map(() => createProfile('Prakash Raj', '2024VI023'));
const level2Profiles = Array(4)
  .fill()
  .map(() => createProfile('Vikram Kumar', '2024VI045'));

const MentorDashboardAcademics = ({navigation}) => {
  const [selectedLevel, setSelectedLevel] = useState('level1');
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState('');
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalAction, setFinalAction] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [profiles, setProfiles] = useState({
    level1: level1Profiles,
    level2: level2Profiles,
  });

  const currentProfiles = profiles[selectedLevel];

  const allFeedbackGiven = Object.values(profiles)
    .flat()
    .every(profile => profile.feedback !== '');

  const toggleCheckbox = index => {
    const newCheckedItems = {...checkedItems, [index]: !checkedItems[index]};
    setCheckedItems(newCheckedItems);
    setIsChecked(Object.values(newCheckedItems).includes(true));
  };

  const getOptionColor = option => {
    switch (option) {
      case 'Highly Attentive':
        return 'green';
      case 'Moderately Attentive':
        return 'blue';
      case 'Not attentive':
        return 'orange';
      case 'Absent':
        return 'red';
      default:
        return 'gray';
    }
  };

  const confirmFeedback = () => {
    const updatedProfiles = currentProfiles.map((profile, index) => {
      if (editIndex !== null && index === editIndex) {
        return {...profile, feedback: selectedFeedback};
      } else if (checkedItems[index]) {
        return {...profile, feedback: selectedFeedback};
      }
      return profile;
    });

    setProfiles(prev => ({
      ...prev,
      [selectedLevel]: updatedProfiles,
    }));

    setShowFeedbackModal(false);
    setCheckedItems({});
    setIsChecked(false);
    setSelectedFeedback('');
    setEditIndex(null);
  };

  useEffect(() => {
    let timer;
    if (loadingProgress > 0 && loadingProgress < 100) {
      timer = setTimeout(() => {
        setLoadingProgress(prev => prev + 20);
      }, 600);
    } else if (loadingProgress >= 100) {
      setSessionStarted(true);
    }
    return () => clearTimeout(timer);
  }, [loadingProgress]);

  const handleStartSession = () => {
    setLoadingProgress(20);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
            <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Academic</Text>
      </View>
      <View style={styles.headerBorder} />

      <View style={styles.sessionBox}>
        <View style={styles.sessionTextRow}>
          <Text style={styles.subject}>Mathematics · 60 min</Text>
          <Text style={styles.time}>09:30 - 10:30</Text>
        </View>
        <Text style={styles.gradeText}>
          Grade VI-A · <Text style={styles.academicText}>Academic</Text>
        </Text>
        <View style={styles.levelRow}>
          <TouchableOpacity
            style={
              selectedLevel === 'level1' ? styles.level1Btn : styles.level2Btn
            }
            onPress={() => setSelectedLevel('level1')}>
            <Text
              style={
                selectedLevel === 'level1'
                  ? styles.level1Text
                  : styles.level2Text
              }>
              Level 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              selectedLevel === 'level2' ? styles.level1Btn : styles.level2Btn
            }
            onPress={() => setSelectedLevel('level2')}>
            <Text
              style={
                selectedLevel === 'level2'
                  ? styles.level1Text
                  : styles.level2Text
              }>
              Level 2
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBox}
        contentContainerStyle={{paddingBottom: 100}}>
        {currentProfiles.map((item, index) => (
          <View key={index} style={styles.profileCard}>
            <Image source={item.image} style={styles.profileImg} />
            <View style={{flex: 1}}>
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileId}>{item.id}</Text>
            </View>

            {item.feedback ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    color: getOptionColor(item.feedback),
                    marginRight: 5,
                  }}>
                  {item.feedback}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const newChecked = {};
                    newChecked[index] = true;
                    setCheckedItems(newChecked);
                    setSelectedFeedback(item.feedback);
                    setEditIndex(index);
                    setShowFeedbackModal(true);
                  }}>
                  <Pencil width={wp('4.5%')} height={wp('4.5%')} />
                </TouchableOpacity>
              </View>
            ) : showCheckboxes ? (
              <TouchableOpacity
                onPress={() => toggleCheckbox(index)}
                style={{marginLeft: 'auto', padding: 5}}>
                {checkedItems[index] ? (
                  <Checkbox width={wp('6%')} height={wp('6%')} />
                ) : (
                  <View
                    style={{
                      width: wp('6%'),
                      height: wp('6%'),
                      borderWidth: 2,
                      borderColor: '#ccc',
                      borderRadius: 4,
                    }}
                  />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>

      {/* Button / Loader */}
      {!sessionStarted ? (
        loadingProgress === 0 ? (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleStartSession}>
            <Text style={styles.completeText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.completeBtn,
              {paddingHorizontal: 0, paddingVertical: 0},
            ]}>
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, {width: `${loadingProgress}%`}]}
              />
            </View>
          </View>
        )
      ) : (
        <TouchableOpacity
          style={[
            styles.completeBtn,
            !allFeedbackGiven && showCheckboxes && !isChecked
              ? {backgroundColor: '#999'}
              : {},
          ]}
          onPress={() => {
            if (isChecked) {
              setShowFeedbackModal(true);
            } else if (showCheckboxes && allFeedbackGiven) {
              setShowFinalModal(true);
            } else if (!showCheckboxes) {
              setShowCheckboxes(true);
            }
          }}
          disabled={!isChecked && showCheckboxes && !allFeedbackGiven}>
          <Text style={styles.completeText}>
            {isChecked ? 'Add Feedback' : 'Complete Session'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <View style={styles.feedbackModal}>
          <Text style={styles.modalTitle}>
            Selected {Object.values(checkedItems).filter(Boolean).length}{' '}
            students
          </Text>
          <Text style={styles.modalQuestion}>How was the performance?</Text>

          {[
            'Highly Attentive',
            'Moderately Attentive',
            'Not attentive',
            'Absent',
          ].map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.radioOption}
              onPress={() => setSelectedFeedback(option)}>
              <View
                style={[
                  styles.radioCircle,
                  {
                    borderColor: getOptionColor(option),
                    backgroundColor:
                      selectedFeedback === option
                        ? getOptionColor(option)
                        : 'transparent',
                  },
                ]}
              />
              <Text style={[styles.radioText, {color: getOptionColor(option)}]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmFeedback}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Final Modal */}
      {showFinalModal && (
        <View style={styles.centeredModal}>
          <Text style={styles.modalQuestion}>Select action for material</Text>

          {['Continue material', 'Complete material'].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.radioOption}
              onPress={() => setFinalAction(action)}>
              <View
                style={[
                  styles.radioCircle,
                  {
                    backgroundColor:
                      finalAction === action ? '#0057FF' : 'transparent',
                    borderColor: '#999',
                  },
                ]}
              />
              <Text
                style={[
                  styles.radioText,
                  {color: finalAction === action ? '#5C2DFF' : '#888'},
                ]}>
                {action}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              console.log(`Selected Action: ${finalAction}`);
              setShowFinalModal(false);
              setShowCheckboxes(false);
            }}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MentorDashboardAcademics;

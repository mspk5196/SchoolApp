import {  View,  Text,  TouchableOpacity,  ScrollView,  KeyboardAvoidingView,  Platform,} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from './bufferfoldersty';
import DateTimePicker from '@react-native-community/datetimepicker';
import Home from '../../../../assets/MentorPage/home.svg';
import LottieView from 'lottie-react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';


const MentorBufferActivityRegister = ({navigation,route}) => {
  const {mentorData} = route.params;
  const [openGrade, setOpenGrade] = useState(false);
  const [grade, setGrade] = useState(null);
  const [gradeItems, setGradeItems] = useState([
    {label: 'Grade 1', value: 'grade1'},
    {label: 'Grade 2', value: 'grade2'},
    {label: 'Grade 3', value: 'grade3'},
  ]);

  const [openSection, setOpenSection] = useState(false);
  const [section, setSection] = useState(null);
  const [sectionItems, setSectionItems] = useState([
    {label: 'A', value: 'A'},
    {label: 'B', value: 'B'},
    {label: 'C', value: 'C'},
  ]);

  const [openActivity, setOpenActivity] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityItems, setActivityItems] = useState([
    {label: 'Sports', value: 'sports'},
    {label: 'Music', value: 'music'},
    {label: 'Art', value: 'art'},
  ]);

  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleFromTimeChange = (event, selectedTime) => {
    setShowFromPicker(false);
    if (selectedTime) {
      setFromTime(selectedTime);
    }
  };

  const handleToTimeChange = (event, selectedTime) => {
    setShowToPicker(false);
    if (selectedTime) {
      setToTime(selectedTime);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Arrow width={wp('9%')} height={wp('9%')} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Buffer Activity</Text>
          </View>
          <View style={styles.headerBorder} />
          <View>
            <LottieView
              source={require('../../../../assets/MentorPage/clock.json')}
              autoPlay
              loop
              style={{width: 130, height: 130, alignSelf: 'center'}}
              resizeMode="cover"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={{marginBottom: openGrade ? 160 : 20, zIndex: 3000}}>
              <Text style={styles.label}>Grade</Text>
              <DropDownPicker
                open={openGrade}
                value={grade}
                items={gradeItems}
                setOpen={setOpenGrade}
                setValue={setGrade}
                setItems={setGradeItems}
                placeholder="Select Grade"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={{marginBottom: openSection ? 150 : 20, zIndex: 2000}}>
              <Text style={styles.label}>Section</Text>
              <DropDownPicker
                open={openSection}
                value={section}
                items={sectionItems}
                setOpen={setOpenSection}
                setValue={setSection}
                setItems={setSectionItems}
                placeholder="Select Section"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={{marginBottom: openActivity ? 150 : 20, zIndex: 1000}}>
              <Text style={styles.label}>Activity</Text>
              <DropDownPicker
                open={openActivity}
                value={activity}
                items={activityItems}
                setOpen={setOpenActivity}
                setValue={setActivity}
                setItems={setActivityItems}
                placeholder="Select Activity"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={styles.timeCard}>
              <Text style={styles.label}>Time</Text>

              <View style={styles.timeRow}>
                <TouchableOpacity
                  onPress={() => setShowFromPicker(true)}
                  style={styles.timeField}>
                  <Text style={styles.timeTextfrom}>
                    From:{' '}
                    {fromTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowToPicker(true)}
                  style={styles.timeField}>
                  <Text style={styles.timeTextto}>
                    {' '}
                    To:{' '}
                    {toTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showFromPicker && (
                <DateTimePicker
                  value={fromTime}
                  mode="time"
                  display="spinner"
                  onChange={handleFromTimeChange}
                />
              )}

              {showToPicker && (
                <DateTimePicker
                  value={toTime}
                  mode="time"
                  display="spinner"
                  onChange={handleToTimeChange}
                />
              )}
            </View>
          </View>
          <View>
            <TouchableOpacity style={styles.confirmButton}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          
          <View style={styles.homeButton} >
            <TouchableOpacity onPress={() => navigation.navigate("MentorHomepage",{mentorData})}>
              <Home width={45} height={45} />
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MentorBufferActivityRegister;

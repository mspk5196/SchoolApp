import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from './bufferfoldersty';
import DateTimePicker from '@react-native-community/datetimepicker';
import Home from '../../../../assets/MentorPage/home.svg';
import LottieView from 'lottie-react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { API_URL } from '../../../../utils/env.js';

const MentorBufferActivityRegister = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [loading, setLoading] = useState(false);
  
  // Grade dropdown
  const [openGrade, setOpenGrade] = useState(false);
  const [grade, setGrade] = useState(null);
  const [gradeItems, setGradeItems] = useState([]);
  
  // Section dropdown
  const [openSection, setOpenSection] = useState(false);
  const [section, setSection] = useState(null);
  const [sectionItems, setSectionItems] = useState([]);
  
  // Activity dropdown
  const [openActivity, setOpenActivity] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityItems, setActivityItems] = useState([]);
  
  // Time pickers
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Fetch grades on mount
  useEffect(() => {
    const fetchGrades = () => {
      fetch(`${API_URL}/api/mentor/grades`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setGradeItems(data.grades.map(grade => ({
            label: grade.grade_name,
            value: grade.id.toString()
          })));
        })
        .catch(error => {
          console.error("Error fetching grades:", error);
        });
    };
    
    fetchGrades();
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    if (grade) {
      const fetchSections = () => {
        fetch(`${API_URL}/api/mentor/sections/${grade}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            setSectionItems(data.sections.map(section => ({
              label: section.section_name,
              value: section.id.toString()
            })));
          })
          .catch(error => {
            console.error("Error fetching sections:", error);
          });
      };
      
      fetchSections();
    }
  }, [grade]);

  // Fetch activities on mount
  useEffect(() => {
    const fetchActivities = () => {
      fetch(`${API_URL}/api/mentor/activity-types`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setActivityItems(data.activityTypes.map(activity => ({
            label: activity.activity_type,
            value: activity.id.toString()
          })));
        })
        .catch(error => {
          console.error("Error fetching activities:", error);
        });
    };
    
    fetchActivities();
  }, []);

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

  const handleSubmit = () => {
    if (!grade || !section || !activity || !fromTime || !toTime) {
      alert('Please fill all fields');
      return;
    }

    if (fromTime >= toTime) {
      alert('End time must be after start time');
      return;
    }

    setLoading(true);
    
    fetch(`${API_URL}/api/mentor/create-buffer-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentor_id: mentorData[0].id,
        activity_type_id: activity,
        grade_id: grade,
        section_ids: [section],
        from_time: fromTime.toTimeString().substr(0, 8),
        to_time: toTime.toTimeString().substr(0, 8)
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      alert('Buffer activity created successfully');
      navigation.goBack();
    })
    .catch(error => {
      console.error("Error creating activity:", error);
      alert('Failed to create buffer activity');
    })
    .finally(() => {
      setLoading(false);
    });
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
            {/* Grade Dropdown */}
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

            {/* Section Dropdown */}
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
                disabled={!grade}
              />
            </View>

            {/* Activity Dropdown */}
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

            {/* Time Selection */}
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
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? 'Creating...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          
          <View style={styles.homeButton} >
            <TouchableOpacity onPress={() => navigation.navigate("MentorMain",{mentorData})}>
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
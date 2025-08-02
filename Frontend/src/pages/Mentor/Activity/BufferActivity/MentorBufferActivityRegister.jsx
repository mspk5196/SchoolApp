import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import styles from './bufferfoldersty';
import DateTimePicker from '@react-native-community/datetimepicker';
import Home from '../../../../assets/MentorPage/home.svg';
import LottieView from 'lottie-react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { API_URL } from '../../../../utils/env.js';

const MentorBufferActivityRegister = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [loading, setLoading] = useState(false);
  
  // Grade modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [grade, setGrade] = useState(null);
  const [gradeName, setGradeName] = useState('');
  const [gradeItems, setGradeItems] = useState([]);
  
  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [section, setSection] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionItems, setSectionItems] = useState([]);
  
  // Activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityName, setActivityName] = useState('');
  const [activityItems, setActivityItems] = useState([]);
  
  // Time pickers
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Fetch grades on mount
  useEffect(() => {
    const fetchGrades = () => {
      setLoading(true);
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
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching grades:", error);
          setLoading(false);
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

  // Select handlers for modals
  const handleGradeSelect = (item) => {
    setGrade(item.value);
    setGradeName(item.label);
    setShowGradeModal(false);
    
    // Reset section when grade changes
    setSection(null);
    setSectionName('');
    
    // Reset activity when grade changes
    setActivity(null);
    setActivityName('');
  };
  
  const handleSectionSelect = (item) => {
    setSection(item.value);
    setSectionName(item.label);
    setShowSectionModal(false);
  };
  
  const handleActivitySelect = (item) => {
    setActivity(item.value);
    setActivityName(item.label);
    setShowActivityModal(false);
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

  // Modal components
  const renderSelectionModal = (visible, onClose, data, onSelect, title, selectedValue) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={data}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={isSelected ? styles.selectedOptionItem : styles.optionItem}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={isSelected ? styles.selectedOptionText : styles.optionText}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.optionList}
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
            {/* Grade Selection */}
            <View style={{marginBottom: 20}}>
              <Text style={styles.label}>Grade</Text>
              <TouchableOpacity 
                style={styles.selectionField}
                onPress={() => setShowGradeModal(true)}
              >
                <Text style={gradeName ? styles.selectedText : styles.placeholderText}>
                  {gradeName || 'Select Grade'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section Selection */}
            <View style={{marginBottom: 20}}>
              <Text style={styles.label}>Section</Text>
              <TouchableOpacity 
                style={[styles.selectionField, !grade && styles.disabledField]}
                onPress={() => {
                  if (grade) setShowSectionModal(true);
                  else alert('Please select a grade first');
                }}
              >
                <Text style={sectionName ? styles.selectedText : styles.placeholderText}>
                  {sectionName || 'Select Section'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Activity Selection */}
            <View style={{marginBottom: 20}}>
              <Text style={styles.label}>Activity</Text>
              <TouchableOpacity 
                style={[styles.selectionField, (!grade || !section) && styles.disabledField]}
                onPress={() => {
                  if (!grade) {
                    alert('Please select a grade first');
                  } else if (!section) {
                    alert('Please select a section first');
                  } else {
                    setShowActivityModal(true);
                  }
                }}
              >
                <Text style={activityName ? styles.selectedText : styles.placeholderText}>
                  {activityName || 'Select Activity'}
                </Text>
              </TouchableOpacity>
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
          </View>
          
          <View style={styles.homeButtonContainer}>
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => navigation.navigate("MentorMain", {mentorData})}
            >
              <Home width={45} height={45} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Grade Selection Modal */}
        {renderSelectionModal(
          showGradeModal,
          () => setShowGradeModal(false),
          gradeItems,
          handleGradeSelect,
          'Select Grade',
          grade
        )}
        
        {/* Section Selection Modal */}
        {renderSelectionModal(
          showSectionModal,
          () => setShowSectionModal(false),
          sectionItems,
          handleSectionSelect,
          'Select Section',
          section
        )}
        
        {/* Activity Selection Modal */}
        {renderSelectionModal(
          showActivityModal,
          () => setShowActivityModal(false),
          activityItems,
          handleActivitySelect,
          'Select Activity',
          activity
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MentorBufferActivityRegister;
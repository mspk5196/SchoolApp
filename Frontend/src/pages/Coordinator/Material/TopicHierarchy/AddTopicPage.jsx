import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/MaterialHome/Back.svg';
import { API_URL } from "../../../../utils/env.js";

const AddTopicPage = ({ navigation, route }) => {
  const { subjectID, subject, grade, gradeID, coordinatorData, parentId } = route.params || {};
  const [formData, setFormData] = useState({
    topic_name: '',
    topic_code: '',
    level: parentId ? 2 : 1, // If has parent, start at level 2
    order_sequence: 1,
    has_assessment: true,
    has_homework: false,
    is_bottom_level: false,
    expected_completion_days: 7,
    pass_percentage: 60.00,
    max_nesting_levels: 5
  });
  const [loading, setLoading] = useState(false);
  const [parentTopics, setParentTopics] = useState([]);
  const [selectedParent, setSelectedParent] = useState(parentId);

  useEffect(() => {
    if (!parentId) {
      fetchParentTopics();
    }
  }, [subjectID]);

  const fetchParentTopics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/topics/hierarchy/${subjectID}/${gradeID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success) {
        // Flatten the hierarchy to get all topics that can be parents
        const flattenTopics = (topics) => {
          let result = [];
          topics.forEach(topic => {
            if (!topic.is_bottom_level) {
              result.push(topic);
            }
            if (topic.children && topic.children.length > 0) {
              result = result.concat(flattenTopics(topic.children));
            }
          });
          return result;
        };
        
        const availableParents = flattenTopics(data.data.hierarchy || []);
        setParentTopics(availableParents);
      }
    } catch (error) {
      console.error("Error fetching parent topics:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate topic code based on topic name
    if (field === 'topic_name' && value) {
      const code = value.toUpperCase().replace(/\s+/g, '_').substring(0, 10);
      setFormData(prev => ({
        ...prev,
        topic_code: `${subject.substring(0, 4).toUpperCase()}_${code}`
      }));
    }
  };

  const handleParentSelection = (parentTopicId) => {
    setSelectedParent(parentTopicId);
    if (parentTopicId) {
      const parentTopic = parentTopics.find(t => t.id === parentTopicId);
      if (parentTopic) {
        setFormData(prev => ({
          ...prev,
          level: parentTopic.level + 1
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        level: 1
      }));
    }
  };

  const validateForm = () => {
    if (!formData.topic_name.trim()) {
      Alert.alert("Error", "Topic name is required");
      return false;
    }
    if (!formData.topic_code.trim()) {
      Alert.alert("Error", "Topic code is required");
      return false;
    }
    if (formData.expected_completion_days < 1) {
      Alert.alert("Error", "Expected completion days must be at least 1");
      return false;
    }
    if (formData.pass_percentage < 0 || formData.pass_percentage > 100) {
      Alert.alert("Error", "Pass percentage must be between 0 and 100");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        subjectId: subjectID,
        parentId: selectedParent,
        level: formData.level,
        topicName: formData.topic_name,
        topicCode: formData.topic_code,
        orderSequence: formData.order_sequence,
        hasAssessment: formData.has_assessment,
        hasHomework: formData.has_homework,
        isBottomLevel: formData.is_bottom_level,
        expectedCompletionDays: formData.expected_completion_days,
        passPercentage: formData.pass_percentage
      };

      const response = await fetch(`${API_URL}/api/coordinator/topics/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "Success", 
          "Topic created successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to create topic");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      Alert.alert("Error", "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Add New Topic</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Topic Information</Text>
          
          {/* Topic Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Topic Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.topic_name}
              onChangeText={(value) => handleInputChange('topic_name', value)}
              placeholder="Enter topic name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Topic Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Topic Code *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.topic_code}
              onChangeText={(value) => handleInputChange('topic_code', value)}
              placeholder="Auto-generated or custom code"
              placeholderTextColor="#999"
            />
          </View>

          {/* Parent Topic Selection */}
          {!parentId && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent Topic (Optional)</Text>
              <View style={styles.parentSelection}>
                <TouchableOpacity
                  style={[styles.parentOption, !selectedParent && styles.selectedParent]}
                  onPress={() => handleParentSelection(null)}
                >
                  <Text style={[styles.parentOptionText, !selectedParent && styles.selectedParentText]}>
                    Root Level Topic
                  </Text>
                </TouchableOpacity>
                {parentTopics.map(topic => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[styles.parentOption, selectedParent === topic.id && styles.selectedParent]}
                    onPress={() => handleParentSelection(topic.id)}
                  >
                    <Text style={[styles.parentOptionText, selectedParent === topic.id && styles.selectedParentText]}>
                      {topic.topic_name} (Level {topic.level})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Order Sequence */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Order Sequence</Text>
            <TextInput
              style={styles.textInput}
              value={formData.order_sequence.toString()}
              onChangeText={(value) => handleInputChange('order_sequence', parseInt(value) || 1)}
              placeholder="1"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Expected Completion Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Completion Days</Text>
            <TextInput
              style={styles.textInput}
              value={formData.expected_completion_days.toString()}
              onChangeText={(value) => handleInputChange('expected_completion_days', parseInt(value) || 7)}
              placeholder="7"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Pass Percentage */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pass Percentage (%)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.pass_percentage.toString()}
              onChangeText={(value) => handleInputChange('pass_percentage', parseFloat(value) || 60)}
              placeholder="60"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.sectionTitle}>Topic Settings</Text>

          {/* Has Assessment */}
          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Has Assessment</Text>
            <Switch
              value={formData.has_assessment}
              onValueChange={(value) => handleInputChange('has_assessment', value)}
              trackColor={{ false: '#767577', true: '#0C36FF' }}
              thumbColor={formData.has_assessment ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Has Homework */}
          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Has Homework</Text>
            <Switch
              value={formData.has_homework}
              onValueChange={(value) => handleInputChange('has_homework', value)}
              trackColor={{ false: '#767577', true: '#0C36FF' }}
              thumbColor={formData.has_homework ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Is Bottom Level */}
          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Is Bottom Level Topic</Text>
            <Switch
              value={formData.is_bottom_level}
              onValueChange={(value) => handleInputChange('is_bottom_level', value)}
              trackColor={{ false: '#767577', true: '#0C36FF' }}
              thumbColor={formData.is_bottom_level ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <Text style={styles.helpText}>
            Bottom level topics are the final topics in the hierarchy and cannot have sub-topics.
          </Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating Topic...' : 'Create Topic'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333'
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  parentSelection: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden'
  },
  parentOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  selectedParent: {
    backgroundColor: '#E6F0FF'
  },
  parentOptionText: {
    fontSize: 14,
    color: '#333'
  },
  selectedParentText: {
    color: '#0C36FF',
    fontWeight: '600'
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 24
  },
  saveButton: {
    backgroundColor: '#0C36FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  disabledButton: {
    backgroundColor: '#999'
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
};

export default AddTopicPage;

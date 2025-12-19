import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as materialApi from '../../../utils/materialApi';

const MentorTopicMaterials = ({ navigation, route }) => {
  const { topicId, topicName } = route.params || {};

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const result = await materialApi.mentorGetTopicMaterials(topicId);
      if (result && result.success) {
        setMaterials(result.materials || []);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error('Fetch materials error:', error);
      Alert.alert('Error', 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const openMaterialUrl = async (material) => {
    try {
      const url = material.material_url || material.url;

      if (!url) {
        Alert.alert('Error', 'No URL available for this material');
        return;
      }

      const finalUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;

      const canOpen = await Linking.canOpenURL(finalUrl);
      if (canOpen) {
        await Linking.openURL(finalUrl);
      } else {
        await Linking.openURL(finalUrl);
        Alert.alert('Error', 'Cannot open this URL on your device');
      }
    } catch (error) {
      console.error('Open URL error:', error);
      Alert.alert('Error', `Failed to open material: ${error.message}`);
    }
  };

  const getMaterialTypeColor = (type) => {
    switch (type) {
      case 'Academic':
        return '#007AFF';
      case 'Classwork_Period':
        return '#34C759';
      case 'Assessment':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Easy':
        return '#34C759';
      case 'Medium':
        return '#FF9500';
      case 'Hard':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'PDF':
        return 'file-pdf-box';
      case 'Video':
        return 'video';
      case 'Image':
        return 'image';
      case 'Text':
        return 'text-box';
      default:
        return 'file';
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        elevation: 1,
        flexDirection: 'row',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#EEF2FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons
          name={getFileTypeIcon(item.material_type)}
          size={26}
          color={getMaterialTypeColor(item.material_type)}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}
          numberOfLines={2}
        >
          {item.material_title}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: getMaterialTypeColor(item.material_type),
              marginRight: 6,
            }}
          >
            <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
              {item.material_type?.replace('_', ' ')}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: getDifficultyColor(item.difficulty_level),
            }}
          >
            <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
              {item.difficulty_level}
            </Text>
          </View>
        </View>

        {item.estimated_duration ? (
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            Estimated: {item.estimated_duration} mins
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => openMaterialUrl(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: '#3B82F6',
            }}
          >
            <MaterialCommunityIcons
              name="open-in-new"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600' }}>
              Open
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title={topicName || 'Materials'} navigation={navigation} />

      {loading && materials.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading materials...</Text>
        </View>
      ) : materials.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>No materials available for this topic.</Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </SafeAreaView>
  );
};

export default MentorTopicMaterials;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Set tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Get access token from storage
  async getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await AsyncStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  // Get refresh token from storage
  async getRefreshToken() {
    if (!this.refreshToken) {
      this.refreshToken = await AsyncStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  // Save tokens to storage
  async saveTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    this.setTokens(accessToken, refreshToken);
  }

  // Clear tokens
  async clearTokens() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, refreshToken);
        return data.data.accessToken;
      } else {
        throw new Error(data.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      throw error;
    }
  }

  // Make authenticated request
  async makeRequest(url, options = {}) {
    let accessToken = await this.getAccessToken();

    const makeCall = async (token) => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });
    };

    try {
      let response = await makeCall(accessToken);

      // If token expired, try to refresh and retry
      if (response.status === 401 || response.status === 403) {
        try {
          accessToken = await this.refreshAccessToken();
          response = await makeCall(accessToken);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          throw new Error('Authentication failed');
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // async register(userData) {
  //   try {
  //     const response = await fetch(`${this.baseURL}/api/auth/register`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(userData),
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       await this.saveTokens(data.data.accessToken, data.data.refreshToken);
  //       return data;
  //     } else {
  //       throw new Error(data.message || 'Registration failed');
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async login(phone, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, data.data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }
  async g_login(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        await this.saveTokens(data.data.accessToken, data.data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (refreshToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  // Get current user profile (requires valid access token; will auto-refresh)
  async getProfile() {
    const response = await this.makeRequest(`/auth/profile`, {
      method: 'GET',
    });
    return response.json();
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }

  /**
   * Download a file from the API
   * @param {string} url - API endpoint (relative to baseURL)
   * @param {string} filename - Name of the file to save
   * @param {object} options - Additional options
   * @returns {Promise} - Download result
   */
  async downloadFile(url, filename, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      const fullUrl = `${this.baseURL}${url}`;

      console.log('Starting download from:', fullUrl);

      if (Platform.OS === 'android') {
        // Request storage permission for Android
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to download files',
              buttonPositive: 'OK',
            }
          );

          console.log('Storage permission:', granted);

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Storage permission denied, attempting download anyway');
          }
        } catch (permErr) {
          console.warn('Permission error:', permErr);
        }

        const downloadDir = '/storage/emulated/0/Download';
        const filePath = `${downloadDir}/${filename}`;


        // Ensure the Downloads directory exists
        const dirExists = await RNFetchBlob.fs.isDir(downloadDir);
        if (!dirExists) {
          console.log('Creating Downloads directory...');
          await RNFetchBlob.fs.mkdir(downloadDir);
        }

        const result = await RNFetchBlob.config({
          fileCache: true,
          path: filePath,
        }).fetch(
          'GET',
          fullUrl,
          accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        );

        console.log('Fetch completed');

        // Check response status
        const info = result.info();
        const statusCode = info.status;
        
        console.log('Response status:', statusCode);
        console.log('Response info:', JSON.stringify(info));

        if (statusCode < 200 || statusCode >= 300) {
          throw new Error(`Server returned status ${statusCode}`);
        }

        // Verify file exists
        const fileExists = await RNFetchBlob.fs.exists(filePath);
        console.log('File exists after download:', fileExists);

        if (!fileExists) {
          throw new Error('File was not saved to device');
        }

        // Get file stats
        const fileStats = await RNFetchBlob.fs.stat(filePath);
        console.log('File size:', fileStats.size, 'bytes');

        if (fileStats.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        // For Android, we can manually trigger a media scan to make file visible
        try {
          await RNFetchBlob.fs.scanFile([{ path: filePath }]);
          console.log('Media scan completed');
        } catch (scanErr) {
          console.warn('Media scan failed:', scanErr);
        }

        console.log('Download successful!');

        return {
          success: true,
          path: filePath,
          message: `File saved successfully!\nCheck: Files > Downloads > ${filename}`,
        };
      } else {
        // iOS: Use RNFS
        const dest = `${RNFS.DocumentDirectoryPath}/${filename}`;
        
        console.log('Download path (iOS):', dest);
        
        const result = await RNFS.downloadFile({
          fromUrl: fullUrl,
          toFile: dest,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }).promise;

        console.log('iOS download result:', result);

        if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
          throw new Error(`HTTP ${result.statusCode || 'unknown'}`);
        }

        // Try to open the file
        try {
          await FileViewer.open(dest, { showOpenWithDialog: true });
        } catch (viewerError) {
          console.log('File saved but could not open viewer:', viewerError);
        }

        return {
          success: true,
          path: dest,
          message: 'File downloaded successfully!\nSaved to: Files app',
        };
      }
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error details:', JSON.stringify(error));
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download file';
      if (error.message) {
        if (error.message.includes('Status Code = 16') || error.message.includes('Download manager')) {
          errorMessage = 'Download failed. Please check your internet connection and try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Storage permission is required to download files.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'File not found on server.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload a file to the API
   * @param {string} url - API endpoint (relative to baseURL)
   * @param {object} file - File object from DocumentPicker
   * @param {string} fieldName - Form field name (default: 'file')
   * @param {object} additionalData - Additional form data to send
   * @returns {Promise} - Upload result
   */
  async uploadFile(url, file, fieldName = 'file', additionalData = {}) {
    try {
      const accessToken = await this.getAccessToken();
      const formData = new FormData();

      // Append the file
      formData.append(fieldName, {
        uri: file.fileCopyUri || file.uri,
        name: file.name || 'upload.file',
        type: file.type || 'application/octet-stream',
      });

      // Append additional data
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });

      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          // Note: Don't set Content-Type for FormData, browser/fetch will set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

export default new ApiService();



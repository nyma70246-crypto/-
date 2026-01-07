/**
 * Image service for Workers Connect app
 * Handles image picking and camera functionality
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string | null;
  fileName?: string | null;
}

/**
 * Request permission to access camera
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[ImageService] Camera permission request error:', error);
    return false;
  }
}

/**
 * Request permission to access photo library
 */
export async function requestPhotoLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[ImageService] Photo library permission request error:', error);
    return false;
  }
}

/**
 * Pick image from camera
 */
export async function pickImageFromCamera(): Promise<ImageAsset | null> {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.warn('[ImageService] Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || undefined,
        fileName: asset.fileName || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('[ImageService] Pick image from camera error:', error);
    return null;
  }
}

/**
 * Pick image from photo library
 */
export async function pickImageFromLibrary(): Promise<ImageAsset | null> {
  try {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      console.warn('[ImageService] Photo library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || undefined,
        fileName: asset.fileName || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('[ImageService] Pick image from library error:', error);
    return null;
  }
}

/**
 * Pick multiple images from photo library
 */
export async function pickMultipleImages(): Promise<ImageAsset[]> {
  try {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      console.warn('[ImageService] Photo library permission denied');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    // Note: allowsMultiple is not a direct option in newer versions
    // The result will contain multiple assets if user selects them

    if (!result.canceled && result.assets.length > 0) {
      return result.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || undefined,
        fileName: asset.fileName || undefined,
      }));
    }

    return [];
  } catch (error) {
    console.error('[ImageService] Pick multiple images error:', error);
    return [];
  }
}

/**
 * Compress image
 */
export async function compressImage(
  imageUri: string,
  quality: number = 0.7
): Promise<string | null> {
  try {
    // For now, just return the original URI
    // In a real app, you'd use a library like react-native-image-resizer
    // to actually compress the image
    return imageUri;
  } catch (error) {
    console.error('[ImageService] Compress image error:', error);
    return null;
  }
}

/**
 * Get image file size
 */
export async function getImageFileSize(imageUri: string): Promise<number | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return null;
  } catch (error) {
    console.error('[ImageService] Get image file size error:', error);
    return null;
  }
}

/**
 * Delete image file
 */
export async function deleteImage(imageUri: string): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(imageUri);
    return true;
  } catch (error) {
    console.error('[ImageService] Delete image error:', error);
    return false;
  }
}

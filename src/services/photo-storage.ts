import * as ImagePicker from 'expo-image-picker';

import { logger } from './logger';
import { isDemoMode, supabase } from './supabase';

/**
 * Fotos del usuario: progreso corporal y comidas.
 *
 * Son de lo más sensible que guarda la app. Reglas:
 * - En Supabase van a un bucket PRIVADO; nunca a uno público.
 * - Se suben bajo `<user_id>/...` para que RLS del bucket las aísle.
 * - En modo demo se quedan en el dispositivo y no salen de él.
 * - Borrar es borrar: no hay papelera ni copia.
 */

export type PhotoKind = 'progress' | 'meal';

export interface StoredPhoto {
  id: string;
  kind: PhotoKind;
  /** URI local (demo) o ruta privada en el bucket (remoto). */
  uri: string;
  takenAt: string;
  width: number;
  height: number;
}

const BUCKET = 'user-photos';

export interface CaptureOptions {
  /** Devuelve también la imagen en base64 (necesario para el escaneo de comida). */
  base64?: boolean;
}

/** Pide permiso y abre la cámara. Devuelve null si el usuario cancela o deniega. */
export async function capturePhoto(
  options: CaptureOptions = {},
): Promise<ImagePicker.ImagePickerAsset | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    // Sin edición: para progreso interesa la foto tal cual, comparable entre semanas.
    allowsEditing: false,
    exif: false,
    base64: options.base64 ?? false,
  });
  return result.canceled ? null : (result.assets[0] ?? null);
}

/** Como capturePhoto, pero desde la galería. */
export async function pickPhoto(
  options: CaptureOptions = {},
): Promise<ImagePicker.ImagePickerAsset | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    exif: false,
    base64: options.base64 ?? false,
  });
  return result.canceled ? null : (result.assets[0] ?? null);
}

/**
 * Guarda la foto. En demo devuelve la URI local; con sesión la sube al bucket
 * privado bajo la carpeta del usuario.
 */
export async function storePhoto(
  asset: ImagePicker.ImagePickerAsset,
  kind: PhotoKind,
  userId: string | null,
): Promise<StoredPhoto> {
  const id = `${kind}-${Date.now()}`;
  const takenAt = new Date().toISOString();
  const base: StoredPhoto = {
    id,
    kind,
    uri: asset.uri,
    takenAt,
    width: asset.width,
    height: asset.height,
  };

  if (isDemoMode || !supabase || !userId) return base;

  try {
    const blob = await (await fetch(asset.uri)).blob();
    const path = `${userId}/${kind}/${id}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    return { ...base, uri: path };
  } catch (error) {
    logger.error('No se pudo subir la foto; se conserva en local', error, { kind });
    return base;
  }
}

/** URL firmada y temporal para ver una foto del bucket privado. */
export async function signedUrl(path: string, seconds = 300): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, seconds);
  if (error) {
    logger.error('No se pudo firmar la URL de la foto', error);
    return null;
  }
  return data.signedUrl;
}

/** Borrado definitivo en el bucket. En demo no hay nada que borrar remotamente. */
export async function deletePhoto(path: string): Promise<boolean> {
  if (isDemoMode || !supabase) return true;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    logger.error('No se pudo borrar la foto', error);
    return false;
  }
  return true;
}

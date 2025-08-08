/**
 * Génère un nom de fichier unique basé sur la date et un nombre aléatoire
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Valide le type de fichier image
 */
export function isValidImageType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  return allowedTypes.includes(mimeType);
}

/**
 * Valide la taille du fichier (max 5MB)
 */
export function isValidFileSize(size: number): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return size <= maxSize;
}

/**
 * Formate la taille du fichier pour l'affichage
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

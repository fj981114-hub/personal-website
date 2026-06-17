import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    'apk': '📱', 'exe': '⚙️', 'dmg': '💿',
    'pdf': '📄', 'doc': '📝', 'docx': '📝',
    'xlsx': '📊', 'pptx': '📽️',
    'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
    'mp4': '🎬', 'mov': '🎬', 'avi': '🎬',
    'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
    'sketch': '🎨', 'fig': '🎨', 'blend': '🧊', 'obj': '🧊', 'glb': '🧊',
    'txt': '📃', 'md': '📃', 'json': '📃',
    'html': '🌐', 'css': '🎨', 'js': '📜', 'ts': '📜',
    'iso': '💿', 'img': '💿',
    'ttf': '🔤', 'otf': '🔤', 'woff': '🔤',
  };
  return icons[type.toLowerCase()] || '📁';
}

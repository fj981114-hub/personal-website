'use client';

import { useRef, useState } from 'react';
import { Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onInsert: (markdown: string) => void;
}

export default function ImageUpload({ onInsert }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 图片格式验证
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('不支持的文件格式，请上传图片');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片过大，最大支持 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '上传失败');
      }

      const data = await res.json();
      // 在光标位置插入 markdown 图片语法
      const alt = file.name.replace(/\.[^.]+$/, '');
      onInsert(`![${alt}](${data.url})`);
      toast.success('图片已插入');
    } catch (err: any) {
      toast.error(err.message || '上传失败');
    } finally {
      setUploading(false);
      // 重置 input 以便重复选择同一文件
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
          bg-accent/10 text-accent-light border border-accent/20
          hover:bg-accent/20 transition-all disabled:opacity-50"
        title="插入图片"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Image size={14} />
        )}
        {uploading ? '上传中...' : '插入图片'}
      </button>
    </>
  );
}

import type { VoicePackFile } from '@/types/readAloud';

export class VoicePackStorage {
  private opfsRoot: FileSystemDirectoryHandle | null = null;

  private async getOpfsRoot(): Promise<FileSystemDirectoryHandle | null> {
    if (this.opfsRoot) return this.opfsRoot;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
      try {
        this.opfsRoot = await navigator.storage.getDirectory();
        return this.opfsRoot;
      } catch (err) {
        console.warn('OPFS not available, using fallback:', err);
      }
    }
    return null;
  }

  public async saveVoiceFile(voiceId: string, file: VoicePackFile, buffer: ArrayBuffer): Promise<string> {
    const root = await this.getOpfsRoot();
    const relativePath = `voices/${voiceId}/${file.relativePath}`;

    if (root) {
      const dirHandle = await root.getDirectoryHandle(`voices`, { create: true });
      const voiceDir = await dirHandle.getDirectoryHandle(voiceId, { create: true });
      const fileHandle = await voiceDir.getFileHandle(file.relativePath, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(buffer);
      await writable.close();
      return relativePath;
    }

    // Fallback: Store as Blob URL or in memory
    return relativePath;
  }

  public async readVoiceFile(voiceId: string, fileName: string): Promise<ArrayBuffer | null> {
    const root = await this.getOpfsRoot();
    if (!root) return null;

    try {
      const dirHandle = await root.getDirectoryHandle('voices');
      const voiceDir = await dirHandle.getDirectoryHandle(voiceId);
      const fileHandle = await voiceDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.arrayBuffer();
    } catch {
      return null;
    }
  }

  public async deleteVoice(voiceId: string): Promise<void> {
    const root = await this.getOpfsRoot();
    if (!root) return;

    try {
      const dirHandle = await root.getDirectoryHandle('voices');
      await dirHandle.removeEntry(voiceId, { recursive: true });
    } catch (e) {
      console.warn(`Could not remove OPFS entry for ${voiceId}:`, e);
    }
  }
}

export const voicePackStorage = new VoicePackStorage();

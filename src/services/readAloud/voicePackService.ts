import type { VoicePackManifest, VoicePackRecord } from '@/types/readAloud';
import { db } from '@/services/database';
import { voicePackStorage } from './voicePackStorage';

export class VoicePackService {
  public validateManifest(manifest: any): manifest is VoicePackManifest {
    return (
      manifest &&
      typeof manifest.id === 'string' &&
      typeof manifest.name === 'string' &&
      typeof manifest.language === 'string' &&
      typeof manifest.totalSizeBytes === 'number' &&
      Array.isArray(manifest.modelFiles)
    );
  }

  public async getInstalledVoicePacks(): Promise<VoicePackRecord[]> {
    return db.voicePacks.toArray();
  }

  public async installVoicePack(
    manifest: VoicePackManifest,
    fetchFileBuffer: (filePath: string) => Promise<ArrayBuffer>,
    onProgress?: (percent: number) => void
  ): Promise<VoicePackRecord> {
    if (!this.validateManifest(manifest)) {
      throw new Error('Invalid voice pack manifest.');
    }

    const totalFiles = manifest.modelFiles.length;
    let completed = 0;

    for (const file of manifest.modelFiles) {
      const buffer = await fetchFileBuffer(file.relativePath);
      await voicePackStorage.saveVoiceFile(manifest.id, file, buffer);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / totalFiles) * 100));
      }
    }

    const record: VoicePackRecord = {
      id: manifest.id,
      name: manifest.name,
      language: manifest.language,
      locale: manifest.locale,
      version: manifest.version,
      sizeBytes: manifest.totalSizeBytes,
      storagePath: `voices/${manifest.id}`,
      licence: manifest.licence,
      installedAt: Date.now(),
    };

    await db.voicePacks.put(record);
    return record;
  }

  public async removeVoicePack(voiceId: string): Promise<void> {
    await voicePackStorage.deleteVoice(voiceId);
    await db.voicePacks.delete(voiceId);
  }
}

export const voicePackService = new VoicePackService();

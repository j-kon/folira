export async function calculateFileFingerprint(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Crypto SHA-256 unavailable, falling back to basic hash:', error);
    return `${file.size}-${file.type}-${(file as File).name || 'file'}`;
  }
}

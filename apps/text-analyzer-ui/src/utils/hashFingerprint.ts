const textEncoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const hashFingerprintInput = async (input: string): Promise<string> => {
  const bytes = textEncoder.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(digest);
};

export const createFileFingerprintHash = async (file: File): Promise<string> => {
  const fingerprint = `${file.name}|${file.size}|${file.lastModified}`;
  return hashFingerprintInput(fingerprint);
};

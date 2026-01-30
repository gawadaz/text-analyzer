const OWNER_ID_KEY = 'text-analyzer-owner-id';

export const getOrCreateOwnerId = (): string => {
  let ownerId = localStorage.getItem(OWNER_ID_KEY);

  if (!ownerId) {
    ownerId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(OWNER_ID_KEY, ownerId);
  }

  return ownerId;
};

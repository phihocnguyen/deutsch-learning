export function ownerStorageKey(base: string, ownerId: string) {
  if (!/^[1-9]\d*$/.test(ownerId)) throw new Error("Invalid learning owner.");
  return `${base}:owner:${ownerId}`;
}

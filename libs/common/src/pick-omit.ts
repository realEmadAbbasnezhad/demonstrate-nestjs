function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// will pick keys that are in the list, if the input is not an object, it will return an empty object
export function runtimePick<
  T extends Record<string, unknown>,
  K extends keyof T,
>(obj: unknown, keys: readonly K[] = []): Pick<T, K> {
  if (!isPlainObject(obj)) return {} as Pick<T, K>;
  const src: Record<string, unknown> = obj;
  const outRecord: Record<string, unknown> = {};

  for (const key of keys) {
    const k = String(key);
    if (Object.prototype.hasOwnProperty.call(src, k)) {
      outRecord[k] = src[k];
    }
  }

  return outRecord as Pick<T, K>;
}

// will remove keys that are not in the list, if the input is not an object, it will return an empty object
export function runtimeOmit<
  T extends Record<string, unknown>,
  K extends keyof T,
>(obj: unknown, keys: readonly K[] = []): Omit<T, K> {
  if (!isPlainObject(obj)) return {} as Omit<T, K>;
  const src: Record<string, unknown> = obj;
  const skip = new Set(keys.map(String));
  const outRecord: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(src)) {
    if (!skip.has(k)) {
      outRecord[k] = v;
    }
  }

  return outRecord as Omit<T, K>;
}

export function isEmpty(obj: any) {
  if (!obj) return true;

  if (obj.length === 0 || obj.size === 0) return false;

  return true;
}

export function getFieldErrorsFromResponse(data) {
  if (!data || !Array.isArray(data.errors)) {
    return {};
  }
  const map = {};
  for (const item of data.errors) {
    if (item.field && item.message) {
      map[item.field] = item.message;
    }
  }
  return map;
}

export function getFirstApiMessage(data) {
  if (!data) return null;
  if (data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  return null;
}

export const isValueUnknown = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

export const formatValue = (value: any): string => {
  if (isValueUnknown(value)) {
    return 'Unknown';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

export const filterAttributes = (
  attributes: Record<string, any> | undefined,
  driftAttributes: Record<string, any>,
  searchValue: string,
): Array<{ key: string; value: any; driftValue?: any; hasDrift: boolean }> => {
  if (!attributes) return [];

  const attributesArray = Object.entries(attributes).map(([key, value]) => ({
    key,
    value,
    driftValue: driftAttributes[key],
    hasDrift: !!driftAttributes[key],
  }));

  if (!searchValue) return attributesArray;

  const lowerSearch = searchValue.toLowerCase();
  return attributesArray.filter(
    item =>
      item.key.toLowerCase().includes(lowerSearch) ||
      JSON.stringify(item.value).toLowerCase().includes(lowerSearch) ||
      (item.driftValue &&
        JSON.stringify(item.driftValue).toLowerCase().includes(lowerSearch)),
  );
};

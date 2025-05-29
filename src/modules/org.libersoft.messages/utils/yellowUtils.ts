export const YELLOW_SRC_PROTOCOL = 'yellow:';

export const isYellowProtocol = (value: any) => {
  return typeof value === 'string' ? value.startsWith(YELLOW_SRC_PROTOCOL) : false;
};

export const extractYellowValue = (str: string) => {
  if (isYellowProtocol(str)) {
    return str.slice(YELLOW_SRC_PROTOCOL.length);
  } else {
    return null;
  }
};

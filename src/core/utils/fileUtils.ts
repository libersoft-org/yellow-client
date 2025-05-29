export function humanSize(bytes: number, decimals: number = 2, forceDecimals: boolean = false): string {
  if (bytes === 0) return forceDecimals ? '0.00 B' : '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const formattedValue = forceDecimals ? value.toFixed(dm) : parseFloat(value.toFixed(dm)).toString();
  // render value with non-breaking space (\u00A0) and unit
  return formattedValue + '\u00A0' + sizes[i];
}

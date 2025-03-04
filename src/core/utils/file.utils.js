export function humanSize(bytes, decimals = 2, forceDecimals = false) {
 if (bytes === 0) return forceDecimals ? '0.00 B' : '0 B';
 const k = 1024;
 const dm = decimals < 0 ? 0 : decimals;
 const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 const value = bytes / Math.pow(k, i);
 const formattedValue = forceDecimals ? value.toFixed(dm) : parseFloat(value.toFixed(dm));
 return formattedValue + ' ' + sizes[i];
}

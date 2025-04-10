export function getColorFromCSSToFilter(name) {
 return hexToCSSFilter(getColorFromCSS(name));
}

export function hexToCSSFilter(hex) {
 hex = hex.trim().replace(/^#/, '');
 if (hex.length === 3)
  hex = hex
   .split('')
   .map(c => c + c)
   .join('');
 if (hex.length !== 6) return '';
 let bigint = parseInt(hex, 16);
 if (isNaN(bigint)) return '';
 let r = (bigint >> 16) & 255;
 let g = (bigint >> 8) & 255;
 let b = bigint & 255;
 let invert = Math.round(((r + g + b) / (3 * 255)) * 100);
 let sepia = 0;
 let saturate = 100;
 let hueRotate = 0;
 let brightness = 100;
 let contrast = 100;
 return `invert(${invert}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(${contrast}%)`;
}

export function getColorFromCSS(name) {
 return getComputedStyle(document.documentElement).getPropertyValue(name);
}

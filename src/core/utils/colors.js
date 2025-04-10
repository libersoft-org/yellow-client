import { hexToCSSFilter } from 'hex-to-css-filter';

export function getColorFromCSSToFilter(name) {
 let v = getColorFromCSS(name);
 v = convertFromShortHex(v);
 return hexToCSSFilter(v).filter;
}

function convertFromShortHex(v) {
 //console.log('convertFromShortHex', v);
 if (v.length === 4) {
  v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
 }
 //console.log('convertFromShortHex=', v);
 return v;
}

export function getColorFromCSS(name) {
 return getComputedStyle(document.documentElement).getPropertyValue(name);
}

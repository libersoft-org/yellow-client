export function truncateText(text, maxLength = 20) {
 if (text.length <= maxLength) {
  return text;
 }

 const startLength = Math.floor((maxLength - 3) / 2); // Part to show at the start
 const endLength = Math.ceil((maxLength - 3) / 2); // Part to show at the end

 const start = text.slice(0, startLength);
 const end = text.slice(-endLength);

 return `${start} ..... ${end}`;
}

export function truncateTextEnd(text, maxLength = 20) {
 if (text.length <= maxLength) {
  return text;
 }

 const endPart = '...'
 return text.slice(0, maxLength - endPart.length) + endPart;
}

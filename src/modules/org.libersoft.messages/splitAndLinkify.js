export function splitAndLinkify(text) {
 let pattern = [
  "(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+" + "(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?" + '(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+' + '(?:\\.[a-zA-Z]{2,})?' + '(?::\\d+)?' + '(?:\\/[^"\\s]*)?)', // <-- exclude " from URL path
  "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+" + "(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?" + '(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+' + '(?:\\.[a-zA-Z]{2,})?' + '(?::\\d+)?' + '(?:\\/[^"\\s]*)?)', // <-- exclude " from URL path
  '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)',
  '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)',
  '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
  '(tel:\\+?[0-9]{1,15})',
 ].join('|');
 //console.log('splitAndLinkify pattern:', pattern);
 const combinedPattern = new RegExp(pattern, 'g');
 const result = [];
 let lastIndex = 0;
 // matchAll returns an iterator of match objects
 for (const match of text.matchAll(combinedPattern)) {
  const matchStart = match.index;
  const matchedText = match[0];
  const nonMatched = text.slice(lastIndex, matchStart);
  if (nonMatched) {
   result.push({
    type: 'plain',
    value: nonMatched,
   });
   //console.log('matchedText:', matchedText, 'matchStart:', matchStart, 'nonMatched:', nonMatched);
  }
  // The matched part
  result.push({
   type: 'processed',
   value: `<a href="${matchedText}" target="_blank">${matchedText}</a>`,
  });
  lastIndex = matchStart + matchedText.length;
 }
 // Handle any trailing text after the final match
 if (lastIndex < text.length) {
  const trailingText = text.slice(lastIndex);
  if (trailingText) {
   //console.log('trailingText:', trailingText);
   result.push({
    type: 'plain',
    value: trailingText,
   });
  }
 }
 return result;
}

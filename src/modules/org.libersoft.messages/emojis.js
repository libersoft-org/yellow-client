
export function emoji_render(codepoints) {
 return codepoints.map(codepoint => String.fromCodePoint(codepoint)).join('');
}

function rgi(codepoints) {
 return codepoints.map(codepoint => codepoint.toString(16).padStart(4, '0')).join('_');
}

export function encodeCodepoints(codepoints) {
 return codepoints.map(cp => cp.toString(16).padStart(4, '0')).join(',');
}

function replaceEmojisWithTags(text) {
 // Enhanced pattern: Attempt to match each "emoji cluster" including ZWJ sequences.
 // Explanation:
 //   \p{Extended_Pictographic}        Match an extended pictographic character (i.e., an emoji).
 //   (?:\u200D\p{Extended_Pictographic})*
 //     - Then match (as many times as occur):
 //       - Zero-Width Joiner (ZWJ) followed by another Extended Pictographic
 //
 // The 'u' flag is required to handle Unicode property escapes correctly.
 /*
 Notes
   Complex Sequences: This pattern works for typical ZWJ sequences like family emojis (👨‍👩‍👧‍👦), combined flags, and some multi-part emoji.
   Variation Selectors: Many emojis also include variation selectors (e.g., \uFE0F). Often this is matched automatically within the same cluster, but for nuanced control, you might need additional logic.
   Browser/Runtime Compatibility: Unicode property escapes (\p{…}) and the u flag require more modern JavaScript engines. If older environments need support, consider a well-maintained polyfill or library such as emoji-regex.
 */
 /*
 // Example usage:
  const input = "Hello 🌍! This is a test: 🏳️‍🌈👨‍👩‍👧‍👦.";
  const output = replaceEmojisWithCodepoints(input);
  console.log(output);
 // Possible output:
 // "Hello <<<1F30D>>>! This is a test: <<<1F3F3 FE0F 200D 1F308>>><<<1F468 200D 1F469 200D 1F467 200D 1F466>>>."
 */
 const emojiRegex = /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;

 return text.replace(emojiRegex, cluster => {
  // 'cluster' is the entire matched ZWJ sequence (or a single emoji if no ZWJs)
  console.log('cluster:', cluster);
  let cluster_array = emoji_cluster_to_array(cluster);
  let codepoints_array_text = encodeCodepoints(cluster_array);
  return `<Emoji codepoints="${codepoints_array_text}" ></Emoji>`;
 });
}

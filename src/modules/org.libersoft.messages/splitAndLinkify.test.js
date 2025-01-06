import { describe, it, expect } from 'vitest';
import { splitAndLinkify } from './splitAndLinkify.js';

describe('splitAndLinkify', () => {
 it('returns an empty array for an empty string', () => {
  const input = '';
  const output = splitAndLinkify(input);
  expect(Array.isArray(output)).toBe(true);
  expect(output).toEqual([]);
 });

 it('handles plain text with no URLs', () => {
  const input = 'Hello world!';
  const output = splitAndLinkify(input);

  // Check basic array structure
  expect(Array.isArray(output)).toBe(true);
  expect(output).toHaveLength(1);

  // Check the shape of the first (and only) item
  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Hello world!',
  });
 });

 it('handles a single URL only', () => {
  const input = 'https://example.com';
  const output = splitAndLinkify(input);

  expect(output).toHaveLength(1);
  expect(output[0]).toEqual({
   type: 'processed',
   value: '<a href="https://example.com" target="_blank">https://example.com</a>',
  });
 });

 it('handles a single URL in the middle of text', () => {
  const input = 'Check this link: https://example.com for more info.';
  const output = splitAndLinkify(input);

  // Expect 3 parts:
  // 1) "Check this link: "
  // 2) processed URL
  // 3) " for more info."
  expect(output).toHaveLength(3);

  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Check this link: ',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="https://example.com" target="_blank">https://example.com</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: ' for more info.',
  });
 });

 it('handles multiple URLs in the text', () => {
  const input = 'Visit https://example.com and also http://test.org!';
  const output = splitAndLinkify(input);

  // Expected breakdown:
  // 1) "Visit "
  // 2) processed link (https://example.com)
  // 3) " and also "
  // 4) processed link (http://test.org)
  // 5) "!"
  expect(output).toHaveLength(5);

  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Visit ',
  });
  expect(output[1].type).toBe('processed');
  expect(output[1].value).toContain('https://example.com');
  expect(output[2]).toEqual({
   type: 'plain',
   value: ' and also ',
  });
  expect(output[3].type).toBe('processed');
  expect(output[3].value).toContain('http://test.org');
  expect(output[4]).toEqual({
   type: 'plain',
   value: '!',
  });
 });

 it('handles URLs adjacent to punctuation', () => {
  const input = 'Check this link (https://example.com), or email me.';
  const output = splitAndLinkify(input);

  // Expected:
  // 1) "Check this link ("
  // 2) processed URL
  // 3) "), or email me."
  expect(output).toHaveLength(3);

  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Check this link (',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="https://example.com" target="_blank">https://example.com</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: '), or email me.',
  });
 });

 it('handles mailto links', () => {
  const input = 'Contact us at mailto:test@example.com or visit our site.';
  const output = splitAndLinkify(input);

  // Expected segments:
  // 1) "Contact us at "
  // 2) processed mailto link
  // 3) " or visit our site."
  expect(output).toHaveLength(3);
  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Contact us at ',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="mailto:test@example.com" target="_blank">mailto:test@example.com</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: ' or visit our site.',
  });
 });

 it('handles tel links', () => {
  const input = 'Call me at tel:+123456789 or tel:987654321!';
  const output = splitAndLinkify(input);

  // Expected breakdown:
  // 1) "Call me at "
  // 2) processed link: tel:+123456789
  // 3) " or "
  // 4) processed link: tel:987654321
  // 5) "!"
  expect(output).toHaveLength(5);

  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Call me at ',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="tel:+123456789" target="_blank">tel:+123456789</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: ' or ',
  });
  expect(output[3]).toEqual({
   type: 'processed',
   value: '<a href="tel:987654321" target="_blank">tel:987654321</a>',
  });
  expect(output[4]).toEqual({
   type: 'plain',
   value: '!',
  });
 });

 it('handles bitcoin and ethereum links', () => {
  const input = 'Pay using bitcoin:bitcoin:1ExampleAddr?amount=0.5 or ethereum:ethereum:0xABC123.';
  const output = splitAndLinkify(input);

  // Expected segments around both crypto links
  expect(output).toEqual([
   { type: 'plain', value: 'Pay using bitcoin:' },
   {
    type: 'processed',
    value: '<a href="bitcoin:1ExampleAddr?amount=0.5" target="_blank">bitcoin:1ExampleAddr?amount=0.5</a>',
   },
   { type: 'plain', value: ' or ethereum:' },
   {
    type: 'processed',
    value: '<a href="ethereum:0xABC123" target="_blank">ethereum:0xABC123</a>',
   },
   { type: 'plain', value: '.' },
  ]);
 });

 it('handles trailing text after the last URL', () => {
  const input = 'Link at the end: https://example.org trailing text.';
  const output = splitAndLinkify(input);

  // Expected:
  // 1) "Link at the end: "
  // 2) processed URL
  // 3) " trailing text."
  expect(output).toHaveLength(3);

  expect(output[0]).toEqual({
   type: 'plain',
   value: 'Link at the end: ',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="https://example.org" target="_blank">https://example.org</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: ' trailing text.',
  });
 });

 it('handles trailing quote after URL with plus sign', () => {
  const input = '<Sticker file="https://root.cz/x+y" />';
  const output = splitAndLinkify(input);

  // Expected:
  // 1) '<Sticker file="'
  // 2) https://root.cz
  // 3) '" />'
  expect(output).toHaveLength(3);

  expect(output[0]).toEqual({
   type: 'plain',
   value: '<Sticker file="',
  });
  expect(output[1]).toEqual({
   type: 'processed',
   value: '<a href="https://root.cz/x+y" target="_blank">https://root.cz/x+y</a>',
  });
  expect(output[2]).toEqual({
   type: 'plain',
   value: '" />',
  });
 });

 it('ensures each element in output has the correct object shape', () => {
  const input = 'Some text with a link https://example.com and tel:+1234.';
  const output = splitAndLinkify(input);

  // Verify each item is an object with { type, value }
  output.forEach(item => {
   expect(item).toEqual(
    expect.objectContaining({
     type: expect.any(String),
     value: expect.any(String),
    })
   );
  });
 });
});

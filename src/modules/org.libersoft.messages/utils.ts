
interface MessageReactionData {
 _type?: 'temporary';
 user_address: string;
 message_uid: string;
 emoji_codepoints_rgi: string;
}

export function makeMessageReaction(data: MessageReactionData) {
 return {
  _type: 'temporary',
  ...data,
 }
}


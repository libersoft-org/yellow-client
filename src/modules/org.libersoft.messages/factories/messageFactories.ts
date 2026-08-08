interface IMessageReactionData {
	_type?: 'temporary';
	user_address: string;
	message_uid: string;
	emoji_codepoints_rgi: string;
}

export function makeMessageReaction(data: IMessageReactionData): IMessageReactionData & { _type: 'temporary' } {
	return {
		_type: 'temporary',
		...data,
	};
}

export interface IAddress {
	address: string;
	name: string;
	path: string;
	index: number;
}
export interface IWallet {
	phrase: string;
	address: string;
	selected_address_index: number;
	name: string;
	addresses?: IAddress[];
}
export interface IToken {
	guid: string;
	icon: string;
	symbol: string;
	name: string;
	contract_address: string;
}
export interface INetwork {
	guid?: string;
	name: string;
	chainID: number;
	explorerURL?: string;
	currency: {
		symbol: string;
		iconURL?: string;
	};
	rpcURLs?: string[];
	tokens?: IToken[];
}
export interface IRPCServer {
	url: string;
	latency: number | null;
	lastBlock: number | null;
	blockAge: number | null;
	isAlive: boolean;
	checking?: boolean;
}
export interface IBalance {
	crypto: {
		amount: string;
		currency: string;
	};
	fiat: {
		amount: string;
		currency: string;
	};
}
export interface ITokenBalance {
	symbol: string;
	contract_address: string;
	balance: {
		amount: string;
		currency: string;
	};
	fiat: {
		amount: string;
		currency: string;
	};
}
export interface IAddressBookItem {
	guid: string;
	name: string;
	address: string;
}
export interface IStatus {
	color: 'red' | 'orange' | 'green';
	text: string;
}

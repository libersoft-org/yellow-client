import { parseUnits } from 'ethers';

export interface ITransactionBalanceValidation {
	amount: bigint;
	fee: bigint;
	currentBalance: bigint;
	nativeBalance: bigint | undefined;
	isToken: boolean;
}

export function parseTransferAmount(value: string | number, decimals: number): bigint | null {
	try {
		return parseUnits(value.toString().replace(',', '.'), decimals);
	} catch (_error) {
		return null;
	}
}

export function validateSufficientBalance({ amount, fee, currentBalance, nativeBalance, isToken }: ITransactionBalanceValidation): string | null {
	if (isToken) {
		if (amount > currentBalance) return 'Insufficient token balance';
		if (nativeBalance === undefined) return 'Native currency balance is still loading';
		if (fee > nativeBalance) return 'Insufficient native currency balance for the transaction fee';
	} else if (amount + fee > currentBalance) return 'Insufficient balance for the amount and transaction fee';
	return null;
}

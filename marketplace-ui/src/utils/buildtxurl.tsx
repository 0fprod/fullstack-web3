import React from 'react';

interface BuildTxUrlProps {
	txHash: string;
}

export const BuildTxUrl: React.FC<BuildTxUrlProps> = ({ txHash }) => {
	return (
		<>
			Tx in progress! Click the block explorer here:
			<u>
				<i>
					<a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank">
						{txHash}
					</a>
				</i>
			</u>
		</>
	);
};

export const TrimAccountAddress = (account: string) => {
	if (!account) return '';
	return `${account.slice(0, 6)}...${account.slice(-4)}`;
};

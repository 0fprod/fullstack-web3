import React from 'react';

// export a function that receives a string and returns an url with the following structure https://sepolia.etherscan.io/tx/<parameter>
interface BuildTxUrlProps {
	txHash: string;
}

const BuildTxUrl: React.FC<BuildTxUrlProps> = ({ txHash }) => {
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

export default BuildTxUrl;

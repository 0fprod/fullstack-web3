import { INftCardProps, NftCard, useNotification } from '@web3uikit/core';
import { useCallback, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export default function MyNfts() {
	const { account, isWeb3Enabled } = useMoralis();
	const dispatch = useNotification();
	const [nfts, setNFTS] = useState([]);

	const fetchNftsByAddress = useCallback(async () => {
		const d = await fetch(`https://deep-index.moralis.io/api/v2/${account}/nft?chain=goerli`, {
			method: 'GET',
			headers: {
				'X-API-KEY': API_KEY,
			},
		});
		return await d.json();
	}, []);

	useEffect(() => {
		if (account != null && fetchNftsByAddress) {
			fetchNftsByAddress().then((response) => {
				setNFTS(response.result);
			});
		}
	}, [account, fetchNftsByAddress]);

	return (
		<>
			<h2>Owned NFTs</h2>
			{isWeb3Enabled
				? nfts.map((nft: INftCardProps['moralisApiResult']) => <NftCard chain="goerli" moralisApiResult={nft} key={`${nft.token_address}${nft.token_id}`} />)
				: 'Please connect a Wallet'}
		</>
	);
}

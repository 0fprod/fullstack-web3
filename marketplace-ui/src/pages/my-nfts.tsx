import { INftCardProps, NftCard, useNotification } from '@web3uikit/core';
import { useCallback, useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import DevMarketplaceAbi from '../../abis/DevMarketplace.json';
import DevAbi from '../../abis/Dev.json';
import { ethers } from 'ethers';

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY ?? '';
const marketplaceContract = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? '';
const devContract = process.env.NEXT_PUBLIC_DEV_CONTRACT ?? '';

export default function MyNfts() {
	const { account, isWeb3Enabled } = useMoralis();
	const [nfts, setNFTS] = useState([]);
	const displayNotification = useNotification();

	//@ts-ignore
	const { runContractFunction: approveNft } = useWeb3Contract();
	//@ts-ignore
	const { runContractFunction: listItem } = useWeb3Contract();

	const clickNft = (nft: INftCardProps['moralisApiResult']) => {
		const { token_address, token_id } = nft;
		const approveParams = {
			abi: DevAbi,
			contractAddress: token_address,
			functionName: 'approve',
			params: {
				to: marketplaceContract,
				tokenId: token_id,
			},
		};

		approveNft({
			params: approveParams,
			onSuccess: (txReceipt: any) => {
				displayNotification({
					type: 'success',
					position: 'topR',
					title: 'Approve',
					message: `Congratulations mate! Tx: ${txReceipt.hash}`,
				});
			},
			onError: (txReceipt: any) => {
				console.error(JSON.stringify(txReceipt));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Could not approve`,
				});
			},
		});
	};

	const listNft = (nft: INftCardProps['moralisApiResult']) => {
		const { token_address, token_id } = nft;

		const listParams = {
			abi: DevMarketplaceAbi,
			contractAddress: marketplaceContract,
			functionName: 'listItem',
			params: {
				nftContractAddress: token_address,
				tokenId: token_id,
				price: ethers.parseUnits('1'),
			},
		};

		listItem({
			params: listParams,
			onSuccess: (results: any) => {
				displayNotification({
					type: 'success',
					position: 'topR',
					title: 'Listed',
					message: `Congratulations mate! Tx: ${results.hash}`,
				});
			},
			onError(error) {
				console.error(JSON.stringify(error));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Could list`,
				});
			},
		});
	};

	const fetchNftsByAddress = useCallback(async () => {
		const d = await fetch(`https://deep-index.moralis.io/api/v2/${account}/nft?chain=sepolia`, {
			method: 'GET',
			headers: {
				'X-API-KEY': MORALIS_API_KEY,
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
				? nfts
					? nfts.map((nft: INftCardProps['moralisApiResult']) => (
							<div>
								<NftCard chain="sepolia" moralisApiResult={nft} key={`${nft.token_address}${nft.token_id}`} />
								<button onClick={(e) => clickNft(nft)}>approve</button>
								<button onClick={(e) => listNft(nft)}>list</button>
							</div>
					  ))
					: 'You have 0 nfts'
				: 'Please connect a Wallet'}
		</>
	);
}

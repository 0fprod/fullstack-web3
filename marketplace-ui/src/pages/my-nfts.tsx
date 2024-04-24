import { INftCardProps, NftCard, useNotification, Button } from '@web3uikit/core';
import { useCallback, useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import DevMarketplaceAbi from '../../abis/DevMarketplace.json';
import DevAbi from '../../abis/Dev.json';
import { ethers } from 'ethers';
import { BuildTxUrl } from '@/utils/buildtxurl';

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY ?? '';
const marketplaceContract = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? '';

export default function MyNfts() {
	const { account, isWeb3Enabled, web3 } = useMoralis();
	const [nfts, setNFTS] = useState([]);
	const displayNotification = useNotification();

	//@ts-ignore
	const { runContractFunction: approveNft } = useWeb3Contract();

	const onApprove = (nft: INftCardProps['moralisApiResult']) => {
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
					// @ts-ignore
					message: BuildTxUrl({ txHash: txReceipt.hash }),
				});
			},
			onError: (txReceipt: any) => {
				console.error(JSON.stringify(txReceipt));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Could not approve!`,
				});
			},
		});
	};

	const onList = (nft: INftCardProps['moralisApiResult']) => {
		const { token_address, token_id } = nft;
		if (web3 === null) {
			return;
		}

		const signer = web3.getSigner();
		const contract = new ethers.Contract(marketplaceContract, DevMarketplaceAbi);
		const tx = {
			to: marketplaceContract,
			value: ethers.parseEther('0'),
			gasLimit: 2000000,
			data: contract.interface.encodeFunctionData('listItem', [token_address, token_id, ethers.parseEther('1')]),
		};

		signer
			.sendTransaction(tx)
			.then((txReceipt) => {
				displayNotification({
					type: 'success',
					position: 'topR',
					title: 'Listed',
					// @ts-ignore
					message: BuildTxUrl({ txHash: txReceipt.hash }),
				});
			})
			.catch((error) => {
				console.error(JSON.stringify(error));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Could not list!`,
				});
			});
	};

	const fetchNftsByAddress = useCallback(async () => {
		if (account === null) {
			return;
		}
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
			<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: '1.5rem', width: '100%', padding: '0.5rem', flexWrap: 'wrap' }}>
				{isWeb3Enabled
					? nfts
						? nfts.map((nft: INftCardProps['moralisApiResult']) => (
								<div key={`${nft.token_address}${nft.token_id}`}>
									<NftCard chain="sepolia" moralisApiResult={nft} />
									<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: '1rem' }}>
										<Button theme="secondary" onClick={(e) => onApprove(nft)} text="Approve" />
										<Button theme="moneyPrimary" onClick={(e) => onList(nft)} text="List!" />
									</div>
								</div>
						  ))
						: 'You have 0 nfts'
					: 'Please connect a Wallet'}
			</div>
		</>
	);
}

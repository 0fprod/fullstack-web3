import styles from './Nftbox.module.css';
import { NextPage } from 'next';
import { Card, useNotification } from '@web3uikit/core';
import { ethers } from 'ethers';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import DevAbi from '../../../abis/Dev.json';
import DevMarketplaceAbi from '../../../abis/DevMarketplace.json';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export interface GraphQLNft {
	id: string;
	nftContractAddress: string;
	buyer: string;
	seller: string;
	price: string;
	tokenId: string;
}

export interface Metadata {}

interface NFTBoxProps {
	nft: GraphQLNft;
	metadata: Metadata;
}

const devContract = process.env.NEXT_PUBLIC_DEV_CONTRACT ?? '';
const marketplaceContract = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? '';

const NFTBox: NextPage<NFTBoxProps> = ({ nft }) => {
	const { isWeb3Enabled, account } = useMoralis();
	const [tokenName, setTokenName] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState('');
	const [isOwner, setIsOwner] = useState(false);
	const displayNotification = useNotification();

	const {
		runContractFunction: getTokenUri,
		data: tokenUri,
		error,
	} = useWeb3Contract({
		abi: DevAbi,
		contractAddress: devContract,
		functionName: 'tokenURI',
		params: {
			tokenId: nft.tokenId,
		},
	});

	const { runContractFunction: getOwnerOfTokenId, data: ownerAddress } = useWeb3Contract({
		abi: DevAbi,
		contractAddress: devContract,
		functionName: 'ownerOf',
		params: {
			tokenId: nft.tokenId,
		},
	});

	const { runContractFunction: handleBuyNft } = useWeb3Contract({
		abi: DevMarketplaceAbi,
		contractAddress: marketplaceContract,
		functionName: 'buyItem',
		msgValue: nft.price,
		params: {
			nftContractAddress: devContract,
			tokenId: nft.tokenId,
		},
	});

	async function updateUI() {
		const requestURL = (tokenUri as string).replace('ipfs://', 'https://ipfs.io/ipfs/');
		const metadata = await (await fetch(requestURL)).json();
		const imageURIURL = (metadata.image as string).replace('ipfs://', 'https://ipfs.io/ipfs/');
		setTokenName(metadata.name);
		setDescription(metadata.description);
		setImage(imageURIURL);
	}

	function foo() {
		handleBuyNft({
			onSuccess: (txReceipt: any) => {
				displayNotification({
					type: 'success',
					position: 'topR',
					title: 'NFT Bought',
					message: `Congratulations mate! Tx: ${txReceipt.hash}`,
				});
			},
			onError: (txReceipt: any) => {
				console.warn('failed to widht', txReceipt);
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Withdraw',
					message: `Tx: ${txReceipt.hash}`,
				});
			},
		});
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			getTokenUri();
			getOwnerOfTokenId();
		}
	}, [isWeb3Enabled]);

	useEffect(() => {
		tokenUri && updateUI();
	}, [tokenUri]);

	useEffect(() => {
		ownerAddress && setIsOwner((ownerAddress as string).toLowerCase() === account?.toLowerCase());
	}, [ownerAddress]);

	useEffect(() => {
		error && console.error('fetching error', error);
	}, [error]);

	return (
		<Card title={tokenName} description={description} style={{ maxWidth: '25rem' }} onClick={foo} isDisabled={isOwner}>
			<div className={styles.box}>
				{image ? <Image src={image} height="200" width="200" alt="laimaje" loader={() => image} /> : 'fecthing image...'}
				<div># {nft.tokenId}</div>
				<div>{ethers.formatEther(nft.price)} ETH</div>
			</div>
		</Card>
	);
};

export default NFTBox;

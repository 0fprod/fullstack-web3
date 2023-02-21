import styles from './Nftbox.module.css';
import { NextPage } from 'next';
import { Card } from '@web3uikit/core';
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

const NFTBox: NextPage<NFTBoxProps> = ({ nft }) => {
	const { isWeb3Enabled } = useMoralis();
	const [tokenName, setTokenName] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState('');

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

	async function updateUI() {
		const requestURL = (tokenUri as string).replace('ipfs://', 'https://ipfs.io/ipfs/');
		const metadata = await (await fetch(requestURL)).json();
		const imageURIURL = (metadata.image as string).replace('ipfs://', 'https://ipfs.io/ipfs/');
		setTokenName(metadata.name);
		setDescription(metadata.description);
		setImage(imageURIURL);
	}

	useEffect(() => {
		isWeb3Enabled && getTokenUri();
	}, [isWeb3Enabled]);

	useEffect(() => {
		tokenUri && updateUI();
	}, [tokenUri]);

	useEffect(() => {
		error && console.error('MYERROR', error);
	}, [error]);

	return (
		<Card title={tokenName} description={description}>
			<div className={styles.box}>
				<Image src={image} height="200" width="200" alt="laimaje" loader={() => image} />
				<div># {nft.tokenId}</div>
				<div>{ethers.formatEther(nft.price)} ETH</div>
			</div>
		</Card>
	);
};

export default NFTBox;

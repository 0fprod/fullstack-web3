import styles from './Nftbox.module.css';
import { NextPage } from 'next';
import { Button, useNotification } from '@web3uikit/core';
import { ethers } from 'ethers';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import DevAbi from '../../../abis/Dev.json';
import DevMarketplaceAbi from '../../../abis/DevMarketplace.json';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TrimAccountAddress } from '@/utils/buildtxurl';

export interface GraphQLNft {
	id: string;
	nftContractAddress: string;
	buyer: string;
	seller: string;
	price: string;
	tokenId: string;
}

export interface Metadata {}

interface Attributes {
	skill: string;
	level: number;
}

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
	const [attributes, setAttributes] = useState<Attributes[]>([]);
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
		setAttributes(metadata.attributes);
	}

	function buyNft() {
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
				console.log(JSON.stringify(txReceipt));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Reverted tx`,
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
		<div className={styles.card}>
			<h2>{tokenName}</h2>
			{image ? <Image src={image} height="200" width="200" alt="laimaje" loader={() => image} /> : 'fecthing image...'}
			<div className={styles.data}>
				<span>
					<i>TokenId: &nbsp;</i> #{nft.tokenId}
				</span>
				<span>
					<i>Owner: &nbsp;</i>
					{isOwner ? 'Myself' : TrimAccountAddress(ownerAddress as string)}
				</span>
				<span>
					<i>Price: &nbsp;</i>
					{ethers.formatEther(nft.price)} ETH
				</span>
			</div>
			<div className={styles.description}>{description}</div>
			<div className={styles.skills}>
				{attributes.map((attr, index) => (
					<div key={index}>
						<span>
							<i>Skill: &nbsp;</i>
							{attr.skill}
						</span>
						&nbsp;&nbsp;
						<span>
							<i>Level: &nbsp;</i>
							{attr.level}
						</span>
					</div>
				))}
			</div>
			<Button theme="moneyPrimary" text="Buy" onClick={buyNft} disabled={isOwner} />
		</div>
	);
};

export default NFTBox;

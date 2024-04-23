import { useNotification, Button, Input } from '@web3uikit/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useMoralis, useMoralisWeb3Api, useWeb3Contract } from 'react-moralis';
import DevAbi from '../../abis/Dev.json';
import { ethers, BigNumberish } from 'ethers';
import Image from 'next/image';

const devContract = process.env.NEXT_PUBLIC_DEV_CONTRACT ?? '';

export default function MintNft() {
	const { isWeb3Enabled, provider, account } = useMoralis();
	const [fee, setFee] = useState(0.01);
	const displayNotification = useNotification();
	const [juniorImage, setJuniorImage] = useState('');
	const [mediorImage, setMediorImage] = useState('');
	const [seniorImage, setSeniorImage] = useState('');
	const juniorUrl = 'ipfs://QmUdwF2Lxg5gFPMMshfBEdmFcydSaJkBpPLitJJjXKWH3j/';
	const mediorUrl = 'ipfs://bafybeiba2jfdfts7in6vntvtu4lonyclcoziiscqrgfinorgyctiigzwju/';
	const seniorUrl = 'ipfs://bafybeicbewerrelcp6raus6of4mdibyj3jbx7fyvtd7jl375srlyuwc2vm/';

	//@ts-ignore
	const { runContractFunction: requestNft } = useWeb3Contract();
	const { Web3API } = useMoralisWeb3Api();

	// const requestNftMintedEvent = async () => {
	// 	const bytes = ethers.toUtf8Bytes('NftMinted(uint8)');
	// 	const topic0 = ethers.keccak256(bytes);
	// };

	const onMint = () => {
		requestNft({
			params: {
				abi: DevAbi,
				contractAddress: devContract,
				functionName: 'requestNft',
				msgValue: ethers.parseEther(fee.toString()).toString(),
			},
			onSuccess: (txReceipt: any) => {
				displayNotification({
					type: 'success',
					position: 'topR',
					title: 'Congrats! Minting is in progress!',
					message: `Tx: ${txReceipt.hash}`,
				});
				// requestNftMintedEvent();
			},
			onError: (txReceipt: any) => {
				console.error(JSON.stringify(txReceipt));
				displayNotification({
					position: 'topR',
					type: 'error',
					title: 'Error',
					message: `Could not mint`,
				});
			},
		});
	};

	const updateFee = (e: any) => {
		setFee(e.target.value ?? 0);
	};

	useEffect(() => {
		const fetchImage = async (url: string, setImage: Dispatch<SetStateAction<string>>) => {
			const imageURIURL = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
			setImage(imageURIURL);
		};
		fetchImage(juniorUrl, setJuniorImage);
		fetchImage(mediorUrl, setMediorImage);
		fetchImage(seniorUrl, setSeniorImage);
	}, []);

	// Test providers logs
	useEffect(() => {
		if (provider) {
			console.log('Provider', provider);
			const bytes = ethers.toUtf8Bytes('NftMinted(uint8)');
			const topic0 = ethers.keccak256(bytes);
			const p = provider as any; // window.ethereum

			const filter = {
				address: devContract,
				topics: [topic0],
			};

			p.on(filter, (log: any, event: any) => {
				console.log('log', log);
				console.log('event', event);
			});
		}
	}, [provider]);
	return (
		<div style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
			<div style={{}}>
				<h1>Mint one randomized nft!</h1>
				<h3>Get your Junior, Medior or Senior!</h3>
			</div>

			<section style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
				{juniorImage ? <Image src={juniorImage} height="200" width="200" alt="junior" loader={() => juniorImage} /> : 'fecthing image...'}
				{mediorImage ? <Image src={mediorImage} height="200" width="200" alt="medior" loader={() => mediorImage} /> : 'fecthing image...'}
				{seniorImage ? <Image src={seniorImage} height="200" width="200" alt="senior" loader={() => seniorImage} /> : 'fecthing image...'}
			</section>
			<section style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
				<Input placeholder={`Minimum fee to mint is 0.01`} type="number" onChange={updateFee} />
				{isWeb3Enabled ? <Button text="Mint" theme="moneyPrimary" onClick={onMint} /> : 'Please connect a Wallet'}
			</section>
		</div>
	);
}

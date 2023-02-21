import styles from '@/styles/Home.module.css';
import { useMoralis } from 'react-moralis';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_NFTS } from '@/gqlqueries/activeNfts.query';
import NFTBox, { GraphQLNft } from '@/components/NFTBox/NFTBox';

export default function Home() {
	const { isWeb3Enabled } = useMoralis();
	const { loading, data: activeNfts } = useQuery(GET_ACTIVE_NFTS);

	return (
		<main className={styles.main}>
			<h1>Marketplace</h1>
			<article>These are the active nfts</article>
			{isWeb3Enabled && (
				<div>
					<div>
						<h3>Benefits</h3>
						<button>Withdraw</button>
					</div>
					{loading ? (
						<span>Fetching...</span>
					) : (
						<ul className={styles.nfts}>
							{activeNfts.nftactives.map((nft: GraphQLNft) => (
								<NFTBox key={nft.id} nft={nft} metadata={{}} />
							))}
						</ul>
					)}
				</div>
			)}
		</main>
	);
}

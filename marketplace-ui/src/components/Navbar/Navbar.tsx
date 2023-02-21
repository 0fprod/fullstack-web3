import styles from './Navbar.module.css';
import Link from 'next/link';
import { ConnectButton, NativeBalance } from '@web3uikit/web3';

export default function Navbar() {
	return (
		<nav className={styles.nav}>
			<ul className={styles.links}>
				<li>
					<Link href="/">Marketplace</Link>
				</li>
				<li>
					<Link href="/my-nfts">My NFTs</Link>
				</li>
			</ul>
			<ConnectButton />
		</nav>
	);
}

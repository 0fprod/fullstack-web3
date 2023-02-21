import { gql } from '@apollo/client';

export const GET_ACTIVE_NFTS = gql`
	{
		nftactives(first: 5, where: { buyer: "0x0000000000000000000000000000000000000000" }) {
			id
			nftContractAddress
			buyer
			seller
			price
			tokenId
		}
	}
`;

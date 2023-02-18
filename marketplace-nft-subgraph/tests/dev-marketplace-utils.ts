import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  NFTListed,
  NFTUnlisted,
  UpdatedPrice
} from "../generated/DevMarketplace/DevMarketplace"

export function createNFTListedEvent(
  nftContractAddress: Address,
  tokenId: BigInt,
  price: BigInt,
  seller: Address
): NFTListed {
  let nftListedEvent = changetype<NFTListed>(newMockEvent())

  nftListedEvent.parameters = new Array()

  nftListedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContractAddress",
      ethereum.Value.fromAddress(nftContractAddress)
    )
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )

  return nftListedEvent
}

export function createNFTUnlistedEvent(
  nftContractAddress: Address,
  tokenId: BigInt,
  owner: Address
): NFTUnlisted {
  let nftUnlistedEvent = changetype<NFTUnlisted>(newMockEvent())

  nftUnlistedEvent.parameters = new Array()

  nftUnlistedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContractAddress",
      ethereum.Value.fromAddress(nftContractAddress)
    )
  )
  nftUnlistedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftUnlistedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return nftUnlistedEvent
}

export function createUpdatedPriceEvent(
  nftContractAddress: Address,
  tokenId: BigInt,
  price: BigInt
): UpdatedPrice {
  let updatedPriceEvent = changetype<UpdatedPrice>(newMockEvent())

  updatedPriceEvent.parameters = new Array()

  updatedPriceEvent.parameters.push(
    new ethereum.EventParam(
      "nftContractAddress",
      ethereum.Value.fromAddress(nftContractAddress)
    )
  )
  updatedPriceEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  updatedPriceEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return updatedPriceEvent
}

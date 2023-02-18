import {
  NFTListed as NFTListedEvent,
  NFTUnlisted as NFTUnlistedEvent,
  UpdatedPrice as UpdatedPriceEvent
} from "../generated/DevMarketplace/DevMarketplace"
import { NFTListed, NFTUnlisted, UpdatedPrice } from "../generated/schema"

export function handleNFTListed(event: NFTListedEvent): void {
  let entity = new NFTListed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftContractAddress = event.params.nftContractAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTUnlisted(event: NFTUnlistedEvent): void {
  let entity = new NFTUnlisted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftContractAddress = event.params.nftContractAddress
  entity.tokenId = event.params.tokenId
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdatedPrice(event: UpdatedPriceEvent): void {
  let entity = new UpdatedPrice(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftContractAddress = event.params.nftContractAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

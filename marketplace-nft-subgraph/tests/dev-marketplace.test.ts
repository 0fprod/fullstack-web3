import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { NFTListed } from "../generated/schema"
import { NFTListed as NFTListedEvent } from "../generated/DevMarketplace/DevMarketplace"
import { handleNFTListed } from "../src/dev-marketplace"
import { createNFTListedEvent } from "./dev-marketplace-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let nftContractAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let tokenId = BigInt.fromI32(234)
    let price = BigInt.fromI32(234)
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newNFTListedEvent = createNFTListedEvent(
      nftContractAddress,
      tokenId,
      price,
      seller
    )
    handleNFTListed(newNFTListedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("NFTListed created and stored", () => {
    assert.entityCount("NFTListed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "NFTListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftContractAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NFTListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )
    assert.fieldEquals(
      "NFTListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )
    assert.fieldEquals(
      "NFTListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})

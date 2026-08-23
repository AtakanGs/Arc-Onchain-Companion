# Arc Testnet deployment

## Builder V1 contract

- Network: Arc Testnet
- Chain ID: `5042002`
- Contract: `0xAC4D30bf3c0CCAb37f1DCb2F84461AfED979C620`
- Explorer: `https://testnet.arcscan.app/address/0xAC4D30bf3c0CCAb37f1DCb2F84461AfED979C620`

The deployed contract is the soulbound `ArcCompanion` ERC-721 used by the Builder V1 frontend. The deployer private key is never committed; deployment is performed from the ignored local `.env` file after `npm run preflight:arc` succeeds.

The initial metadata base URI is intentionally empty instead of pointing at a placeholder. It can be configured later by the contract owner with `setMetadataBaseURI` once the production metadata endpoint is live.

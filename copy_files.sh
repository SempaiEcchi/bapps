#!/bin/bash
set -e

# make sure destination exists
mkdir -p client/abi

# copy deployed addresses
cp ignition/deployments/chain-31337/deployed_addresses.json client/abi/deployed_addresses.json
cp ignition/deployments/chain-31337/artifacts/Casino#VRFCoordinatorV2Mock.json client/abi/VRFCoordinatorV2Mock.json

# copy Roulette ABI
cp artifacts/contracts/Roulette.sol/Roulette.json client/abi/Roulette.json

echo "✅ Copied ABI + deployed addresses to client/abi/"

// ignition/modules/Casino.js
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Casino", (m) => {
    const BASE_FEE = m.getParameter("baseFee", "250000000000000000"); // 0.25 LINK
    const GAS_PRICE_LINK = m.getParameter("gasPriceLink", "1000000000"); // 1 gwei
    const vrfMock = m.contract("VRFCoordinatorV2Mock", [BASE_FEE, GAS_PRICE_LINK]);

    // 1. Create subscription
    const createSubTx = m.call(vrfMock, "createSubscription", []);
    const subId = m.readEventArgument(createSubTx, "SubscriptionCreated", "subId");

    // 2. Fund subscription with 10 ETH (mock LINK)
    m.call(vrfMock, "fundSubscription", [subId, "10000000000000000000"]); // 10 ETH

    // Chainlink VRF params
    const keyHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
    const callbackGasLimit = 100000;
    const requestConfirmations = 3;
    const numWords = 1;

    // 3. Deploy Roulette with dynamic subId
    const roulette = m.contract("Roulette", [
        vrfMock,
        subId,
        keyHash,
        callbackGasLimit,
        requestConfirmations,
        numWords,
    ]);

    return { vrfMock, roulette };
});

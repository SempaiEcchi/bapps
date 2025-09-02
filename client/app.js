import {
    BrowserProvider,
    Contract,
    parseEther,
    formatEther
} from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.min.js";

let provider, signer, Roulette, VRFMock;

// ==========================
// 🔌 CONNECT WALLET
// ==========================
export async function connectWallet() {
    try {
        console.log("🔌 Connecting wallet...");

        if (!window.ethereum) {
            alert("MetaMask not found. Please install it.");
            return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const address = await signer.getAddress();
        document.getElementById("walletAddress").innerText =
            "Connected: " + address;

        // Ensure Hardhat localhost
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 31337) {
            alert("⚠️ Switch MetaMask to Hardhat (chainId 31337)");
        }

        // Load ABIs + addresses
        const rouletteArtifact = await fetch("./abi/Roulette.json").then((res) => res.json());
        const vrfArtifact = await fetch("./abi/VRFCoordinatorV2Mock.json").then((res) => res.json());
        const addresses = await fetch("./abi/deployed_addresses.json").then((res) => res.json());

        const ROULETTE_ADDRESS = addresses["Casino#Roulette"];
        const VRF_ADDRESS = addresses["Casino#VRFCoordinatorV2Mock"];

        if (!ROULETTE_ADDRESS || !VRF_ADDRESS) {
            throw new Error("❌ Missing deployed contract addresses.");
        }

        // Init contracts
        Roulette = new Contract(ROULETTE_ADDRESS, rouletteArtifact.abi, signer);
        VRFMock = new Contract(VRF_ADDRESS, vrfArtifact.abi, signer);

        console.log("✅ Contracts initialized");

        setupRouletteListeners();


    } catch (err) {
        console.error("❌ Wallet connection failed:", err);
        alert("Failed to connect wallet: " + err.message);
    }
}

// ==========================
// 🎧 EVENT LISTENERS
// ==========================
function setupRouletteListeners() {
    if (!Roulette) return;

    Roulette.on("BetPlaced", (player, username, number, amount) => {
        appendLog(`📌 BetPlaced: ${username} (${player}) bet ${formatEther(amount)} ETH on ${number}`);
    });

    Roulette.on("BetResult", (player, username, winningNumber, won) => {
        appendLog(`🎉 BetResult: ${username} → winning number ${winningNumber} → ${
            won ? "WON 🎊" : "lost ❌"
        }`);
    });
}

// ==========================
// 📝 LOGGING
// ==========================
function appendLog(msg) {
    const log = document.getElementById("log");
    const p = document.createElement("p");
    p.textContent = msg;
    log.prepend(p);
}

// ==========================
// 🎲 PLACE BET
// ==========================
async function placeBet(username, number, amountEth) {
    if (!Roulette) {
        alert("Please connect wallet first.");
        return;
    }

    try {
        const tx = await Roulette.placeBet(username, number, {
            value: parseEther(amountEth),
        });
        appendLog(`⏳ Transaction sent: ${tx.hash}`);
        await tx.wait();
        appendLog("✅ Transaction confirmed!");
    } catch (err) {
        console.error("❌ Bet failed:", err);
        alert("Bet failed: " + err.message);
    }
}

// ==========================
// 🎰 FULFILL VRF (mock)
// ==========================
async function fulfillVRF() {
    if (!VRFMock || !Roulette) {
        alert("Contracts not initialized.");
        return;
    }

    try {
        // find last requestId
        const filter = VRFMock.filters.RandomWordsRequested();
        const events = await VRFMock.queryFilter(filter);
        if (events.length === 0) {
            alert("No VRF requests found yet.");
            return;
        }

        const requestId = events[events.length - 1].args.requestId;
        appendLog(`⚡ Fulfilling VRF requestId ${requestId}`);

        const tx = await VRFMock.fulfillRandomWords(requestId, await Roulette.getAddress());
        await tx.wait();

        appendLog("✅ VRF fulfilled");
    } catch (err) {
        console.error("❌ Fulfill failed:", err);
        alert("Fulfill failed: " + err.message);
    }
}

// ==========================
// 🎮 UI HOOKUP
// ==========================
document.getElementById("connectBtn").addEventListener("click", connectWallet);

document.getElementById("betForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const number = parseInt(document.getElementById("number").value);
    const amount = document.getElementById("amount").value;

    if (number < 0 || number > 36) {
        alert("Number must be between 0 and 36");
        return;
    }

    await placeBet(username, number, amount);
});

document.getElementById("fulfillBtn").addEventListener("click", fulfillVRF);

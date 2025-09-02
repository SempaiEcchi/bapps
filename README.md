# 🎲 Roulette dApp

A decentralized **Roulette game** built with **Solidity**, **Hardhat Ignition**, and **Chainlink VRF (mock)** for randomness.  
Frontend is a lightweight HTML/JS app that connects via **Ethers.js v6**.

---

## 📂 Project Structure

```text
contracts/             # Solidity contracts
  Roulette.sol         # Main roulette game contract

ignition/modules/      # Hardhat Ignition deployment scripts
  Casino.js            # Deploys VRF mock + Roulette

abi/                   # ABIs + deployed addresses (generated after deployment)

app.js                 # Frontend dApp logic
index.html             # Frontend UI
styles.css             # Basic styling
```

---

## 🚀 Features

- ✅ **Roulette betting** (pick a number 0–36)
- ✅ **Chainlink VRF (mocked)** random number generation
- ✅ **Event-driven UI** (bets + results update live)
- ✅ **Owner controls** (withdraw funds)
- ✅ **Frontend integration** with MetaMask

---

## 🛠️ Setup & Installation

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd roulette-dapp
npm install
```

### 2. Run Local Hardhat Node
```bash
npx hardhat node
```

Leave this terminal running — it simulates a blockchain.

### 3. Deploy Contracts with Ignition
Open a new terminal and run:
```bash
npx hardhat ignition deploy ./ignition/modules/Casino.js --network localhost
```

This will:
- Deploy `VRFCoordinatorV2Mock`
- Create + fund a VRF subscription
- Deploy `Roulette` with the dynamic subscription ID
- Save deployed addresses to `abi/deployed_addresses.json`

### 4. Generate ABIs
If not already available, export ABIs:
```bash
npx hardhat compile
```
and copy contract artifacts into `/abi`.

---

## 🌐 Frontend (Local)

1. Open **`index.html`** in a browser (best with a local web server).  
   Example using VS Code:
   ```bash
   npx serve .
   ```
   or with Python:
   ```bash
   python3 -m http.server
   ```

2. In MetaMask:
    - Add **Localhost 8545** (chainId: `31337`)
    - Import one of Hardhat’s test accounts using its private key.

3. Connect your wallet in the UI.

---

## 🎮 Usage

1. **Connect Wallet** → Click `Connect Wallet`.
2. **Place a Bet** → Enter `username`, pick a number (0–36), and enter ETH amount.
3. **Fulfill VRF (Local Test)** → Since we use a **mock VRF**, click `Fulfill VRF` after placing a bet to resolve it.
4. **Check Game Log** → See bet + result events in real time.

---

## ⚙️ Contract Details

- **House edge**: `2%`
- **Minimum bet**: `0.01 ETH`
- **Payout**: 36× (minus house edge) if you hit your number
- **Events**:
    - `BetPlaced(player, username, number, amount)`
    - `BetResult(player, username, winningNumber, won)`

---

## 🔐 Owner Functions

- `withdraw()` → withdraws contract balance to owner.
- `receive()` → contract can accept ETH.

---

## 🧪 Testing VRF Mock

- Deploy script funds the VRF subscription with **10 ETH** (mock LINK).
- Use the **Fulfill VRF** button in the UI to simulate Chainlink’s oracle returning randomness.

---

 
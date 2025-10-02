# Telegram Solana Trading Bot

A production-oriented Telegram bot that automates token discovery, execution, and portfolio tracking across the Solana ecosystem. The bot connects to Raydium AMM/CLMM pools, Jupiter, and Pump.fun to execute trades using Jito-powered transactions while managing user preferences and risk controls.

## Core Auto-Trading Flow

The primary workflow of the bot is an event-driven **auto-buy / auto-sell loop** that reacts to Telegram messages:

1. **Trigger Detection** – When a message containing the keyword `buy` and a valid Solana contract address is posted in a configured Telegram chat (direct message with the bot or a group conversation), the bot parses the address from the message body.
2. **Quote & Validation** – The extracted contract address is validated against supported liquidity sources (Raydium, Jupiter, Pump.fun). The bot confirms the token is tradable, checks configured risk controls (slippage, max size, liquidity thresholds), and determines the optimal swap route.
3. **Auto-Buy Execution** – After validation, the bot automatically purchases the token using the user’s configured allocation. Transactions are submitted through Jito bundles when available to minimize frontrunning.
4. **Position Monitoring** – Token positions acquired through auto-buy are tracked in MongoDB for portfolio reporting, exposure management, and follow-up automation.
5. **Auto-Sell Trigger** – When a message containing the keyword `sell` and a contract address is posted, the bot looks up the user’s holdings for that address and automatically sells **100%** of the tracked balance via the same routing engine used for buys.
6. **Post-Trade Reporting** – Fill confirmations, PnL updates, and any execution alerts are published back into Telegram chats and persisted for dashboards or scheduled reports.

This messaging-first workflow enables teams to orchestrate fast-moving trades by broadcasting simple chat commands while the bot enforces guardrails and handles settlement. The automation layers on top of traditional trading features such as limit/market order support, scheduled strategies, and granular risk controls.

## Functional Overview

### Market Intelligence
- Continuously indexes Raydium, Jupiter, and Pump.fun liquidity pools to surface newly launched and trending tokens.
- Collects token metadata, pricing, and liquidity insights via Birdeye and on-chain RPC queries.
- Supports configurable filters for pool type, liquidity thresholds, and token whitelists/blacklists.

### Trade Execution
- Places market and limit-style orders for SPL tokens through Raydium CLMM/AMM and Jupiter swap routes.
- Uses Jito bundles to improve confirmation speed and protect against frontrunning.
- Integrates Pump.fun flows for early-stage tokens, including mint detection and auto-entry.

### Automation & Risk Controls
- Auto-buy and auto-sell rules driven by per-user configuration (size, slippage, take-profit, stop-loss).
- Scheduled tasks (cron) for rebalance, auto-sell, and liquidity/volume monitoring.
- Retry logic and transaction health checks to recover from RPC or network interruptions.

### Portfolio & Reporting
- Generates PnL summaries and trade history cards for delivery inside Telegram chats.
- Persists wallet activity, token positions, and configuration in MongoDB with Redis-backed caching.
- Exposes alerting hooks to broadcast fills, price moves, and rule-based notifications.

### Security Model
- Creates isolated guardian wallets for each user; private keys are never requested from end users.
- Supports configurable RPC endpoints (public/private) and WebSocket streams for state tracking.
- Environment-based secrets handling via `.env` and runtime validation.

## Requirements

- **Runtime:** Node.js 18+
- **Blockchain Access:** Solana RPC endpoint (HTTPS) and WebSocket endpoint; optional private RPC for high-throughput trading.
- **Datastores:** MongoDB cluster URI for persistent storage, Redis URI for caching/rate limiting.
- **Telegram:** Bot token generated via BotFather for each Telegram integration (trading bot, alert bot, bridge bot).
- **External Services:**
  - Jito account UUID for bundle submission.
  - Birdeye API key for market data enrichment.
  - Optional PnL image generator and GrowSol API endpoints if leveraging hosted services.

## Project Structure

```
src/
  main.ts                # Application bootstrap and dependency wiring
  bot.opts.ts            # Telegram bot command/keyboard configuration
  config.ts              # Environment validation and shared configuration
  controllers/           # Handlers for Telegram commands and REST endpoints
  cron/                  # Scheduled automation (auto-sell, liquidity checks, etc.)
  models/                # MongoDB schemas for users, wallets, and trades
  pump/, raydium/        # Integrations for Pump.fun and Raydium order flow
  services/              # Business logic: trading, wallets, risk controls
  utils/                 # Helpers for RPC calls, formatting, and retry logic
```

## Setup

1. **Install dependencies**
    ```sh
    npm install
    ```
2. **Configure environment** by creating a `.env` file in the project root:
    ```ini
    MONGODB_URL=
    REDIS_URI=

    GROWTRADE_BOT_ID=
    GROWSOL_ALERT_BOT_ID=
    BridgeBotID=
    ALERT_BOT_API_TOKEN=
    TELEGRAM_BOT_API_TOKEN=

    MAINNET_RPC=
    PRIVATE_RPC_ENDPOINT=
    RPC_WEBSOCKET_ENDPOINT=

    JITO_UUID=
    BIRD_EVE_API=
    GROWSOL_API_ENDPOINT=
    PNL_IMG_GENERATOR_API=
    ```
3. **Run the bot**
    ```sh
    npm run serve
    ```

## Operational Notes

- Use `npm start` for a single-run execution (via `ts-node`) in production environments.
- Cron jobs and automated strategies rely on accurate system time; deploy on infrastructure with NTP synchronization.
- Monitor MongoDB and Redis resource usage when scaling concurrent Telegram sessions or automated strategies.

## Version

- 1.0 – 21/06/2024

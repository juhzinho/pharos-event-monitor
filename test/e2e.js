import { runCases } from "./runner.js";

const MONITOR = "monitor.js";
const DEAD = "0x000000000000000000000000000000000000dEaD";

await runCases([
  {
    name: "USDC --once decodes every field",
    args: [MONITOR, "USDC", "--lookback", "1000", "--once"],
    code: 0,
    expect: /topic0 0xddf252ad[\s\S]*\[block [\d,]+\] (TRANSFER|MINT|BURN) [\d,.]+ USDC  from .+ → to .+\n    tx 0x[0-9a-f]{64}\n[\s\S]*Blocks [\d,]+ to [\d,]+ checked\.\s+Summary: \d+ transfers/,
  },
  { name: "high --min filters everything out", args: [MONITOR, "USDC", "--lookback", "1000", "--min", "1000000000", "--once"], code: 0, expect: /\d+ transfers seen, 0 with amount/ },
  { name: "decimal --min", args: [MONITOR, "USDC", "--lookback", "300", "--min", "0.5", "--once"], code: 0, expect: /amount ≥ 0\.5 USDC/ },
  { name: "WPROS --once --links", args: [MONITOR, "WPROS", "--lookback", "500", "--once", "--links"], code: 0, expect: /Summary:/, reject: /    tx 0x/ },
  {
    name: "live mode keeps running",
    args: [MONITOR, "USDC", "--lookback", "0", "--interval", "2"],
    killAfter: 25_000,
    code: null,
    expect: /history loaded \(up to block [\d,]+\)\. Watching for new events/,
    reject: /Error|Warning/,
  },
  { name: "invalid token", args: [MONITOR, "nothing"], code: 1, expect: /Invalid token/ },
  { name: "--min without a number", args: [MONITOR, "USDC", "--min", "abc"], code: 1, expect: /--min needs a number/ },
  { name: "--interval too low", args: [MONITOR, "USDC", "--interval", "0"], code: 1, expect: /--interval must be at least/ },
  { name: "--lookback above the limit", args: [MONITOR, "USDC", "--lookback", "5000"], code: 1, expect: /--lookback must be/ },
  { name: "address without a contract", args: [MONITOR, DEAD, "--once"], code: 1, expect: /did not respond as an ERC20 token/ },
]);

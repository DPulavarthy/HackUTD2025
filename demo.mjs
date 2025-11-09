import fs from "node:fs/promises";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ChatCarAdvisor } from "./chat-car-advisor-wrapper.js";

const rl = readline.createInterface({ input, output });

const advisor = new ChatCarAdvisor({
  ask: async (q) => {
    const a = await rl.question(q + " ");
    return a ?? "";
  },
  say: (m) => console.log(m)
});

// Load your JSON data
const carsJson = JSON.parse(
  await fs.readFile("./cars_with_links_annotated.json", "utf-8"));
// Run the interactive flow
const result = await advisor.runInteractive(carsJson, {
  topK: 5,              // show top 5
  requireSources: true  // include link_usage in the output
});

console.log("\nTop matches:");
console.log(JSON.stringify(result, null, 2));

await rl.close();

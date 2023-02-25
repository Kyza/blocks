import fs from "fs";

const pomsky = fs.readFileSync(
	"node_modules/pomsky-wasm/pomsky_wasm_bg.wasm"
);
fs.writeFileSync(
	"./blocks/pomsky-viewer/pomsky-wasm.json",
	JSON.stringify([...pomsky])
);

const fs = require("fs");

if (fs.existsSync("./build/contracts/Trackr.json")) {
    const contract = JSON.parse(fs.readFileSync("./build/contracts/Trackr.json", "utf-8"));

    fs.writeFileSync("../frontend/abi/Trackr.json", JSON.stringify(contract.abi, null, 4));

    console.info("Exporting Trackr ABI Completed");
} else {
    console.error("Build the contract first! Use `truffle migrate` or `truffle compile`")
}
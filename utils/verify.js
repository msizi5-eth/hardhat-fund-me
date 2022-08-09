const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verifying contract...");

  // You can check out the github repo to see other functions that you can call.
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    // I'm not sure what the exact output of the error is, so I just left the
    // 'includes' section as all lower caps.
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };

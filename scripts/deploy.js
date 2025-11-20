8const { ethers, upgrades, run } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with:', deployer.address);

    // Deploy ECOToken first
    const ECOToken = await ethers.getContractFactory('ECOToken');
    const ecoToken = await ECOToken.deploy();
    await ecoToken.waitForDeployment();
    console.log('ECOToken deployed to:', await ecoToken.getAddress());

    // Deploy JewelrySwap with ECO
    const JewelrySwap = await ethers.getContractFactory('JewelrySwap');
    const jewelrySwap = await upgrades.deployProxy(JewelrySwap, [await ecoToken.getAddress(), deployer.address]);
    await jewelrySwap.waitForDeployment();
    console.log('JewelrySwap deployed to:', await jewelrySwap.getAddress());

    // Verify (optional for testnet)
    if (network.name !== 'hardhat') {
        await run('verify:verify', { address: await ecoToken.getAddress(), constructorArguments: [] });
        await run('verify:verify', { address: await jewelrySwap.getAddress(), constructorArguments: [await ecoToken.getAddress(), deployer.address] });
    }

    console.log('Deployment complete! Addresses saved.');
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });

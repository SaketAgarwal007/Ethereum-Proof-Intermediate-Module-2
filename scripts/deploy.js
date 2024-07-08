async function main() {
  const Airdock = await ethers.getContractFactory("airdock");
  const airdock = await Airdock.deploy();

  await airdock.deployed();

  console.log("Airdock deployed to:", airdock.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

require("dotenv").config();

var bridgeAbi = require("./abis/ERC1155TokenBridge.json");
var iBridgeAbi = require("./abis/IERC1155TokenBridge.json");
var networkDatas = [   
  {
      url: '',
      networkId: 25,
      gatewayContractAddress: ''
  },
  {
      url: '',
      networkId: 4002,
      gatewayContractAddress: ''
  }
];

var ethers = require("ethers");

function connectToEthers(mnemonic) {
  // pass in mnemonic key and get signer
  function getSigner(mnemonic) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const signer = wallet.connect(provider);
    return signer;
  }

  // connect to an ethers json rpc provider
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ETH_RPC_URL
  );

  // get the signer from the mnemonic
  const signer = getSigner(process.env.MNEMONIC);
  return { provider, signer };
}

function loadContract(abi, address) {
  // get a reference to the NFTGemMultiToken contract
  return new ethers.Contract(address, abi, signer);
}

function getConfig() {
  // check if networks url, networkId or gatewayContractAddress is empty
  networkDatas.forEach((net) => {
    if (!net.url || !net.networkId || !net.gatewayContractAddress) {
      throw new Error('Invalid configuration');
    }
    // create and save contract handler
    net.gatewayContract = loadContract(bridgeAbi, net.gatewayContractAddress);
  });

  return networks;
}

const networks = getConfig();

const { provider, signer } = connectToEthers(process.env.MNEMONIC);

module.exports = {
  ethers,
  provider,
  bridgeAbi,
  iBridgeAbi,
  networks,
  signer
};

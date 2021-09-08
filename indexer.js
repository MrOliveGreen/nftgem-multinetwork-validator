require("dotenv").config();

var fs = require("fs");
const { createClient } = require("redis");

var {
    ethers,
    provider,
    bridgeAbi,
    iBridgeAbi,
    networks,
    signer
} = require("./blockchain");

var { BigNumber } = ethers;

// hold network contract, redis handler
var networks = [];

async function configureNetworks() {

    // Configure a network
    async function configureNetwork(net){
        const result = { };

        // get reference to the ERC1155TokenBridge contract
        const gatewayContract = new ethers.Contract(net.gatewayContractAddress, bridgeAbi, signer);

        // Check if the node can be a validator
        if (!await gatewayContract.isValidator(await sender.getAddress())) {
            throw new Error('You are not a validator');
        }

        // Create Redis client to push and pull cache data
        result.client = createClient();

        result.client.on('error', (err) => console.log('Redis Client Error', err));

        await result.client.connect();

        // this is the event handler that listens to NetworkTransfer events and forwards to the correct queue and network
        gatewayContract.on(
            "NetworkTransfer",
            async (tokenAddress, receiptId, fromNetworkId, _from, toNetworkId, _to, _id, _value, isBatch) => {
                // create an object (for easy transport) with all the values in event
                // read the array of message from the destination queue
                // append the message to the queue
                // write the message array to the dest netwok
                const theMessage = { tokenAddress, receiptId, fromNetworkId, _from, toNetworkId, _to, _id, _value, isBatch };
                // default transfer status as CREATED
                theMessage.status = 0;

                // get redis client messages array with network id as key
                let arr = await result.client.get(`network_${toNetworkId}`);
                if (!arr) {
                arr = [theMessage];
                } else arr.push(theMessage);
                // save new messages to redis
                await result.client.set(`network_${toNetworkId}`, arr);
                
                // Print the details to console
                console.log("NetworkTransfer received: ", theMessage);
                
                // get the target network handler from the config
                // and relay the event to the target network
                var targetNetwork = networks.find(network => network.id == toNetworkId);
                if(targetNetwork){
                    await targetNetwork.gatewayContract.validateTransfer(receiptId, toNetworkId, _from, _to, _id, _value);
                } else {
                    console.log("Relaying NetworkTransfer Failed. Cannot find the targetNetwork. toNetworkId: ", toNetworkId);
                }
            }
        );

        // this is the event handler that listens to NetworkTransferStatus events and changes the queue status and forwards to source network
        gatewayContract.on(
            "NetworkTransferStatus",
            async (receiptId, status) => {
                // read the array of message from correct queue
                // find the message with receiptId
                // relay the event to source network
                let arr = await result.client.get(`network_${net.networkId}`);
                if (!arr) {
                    console.log("Relaying NetworkTransferStatus Failed. Cannot find the cache messages. networkId: ", net.networkId);
                    return;
                }

                // Filter the messages to get correct message with receiptId
                let msg = arr.find(it => it.receiptId == receiptId);
                if (!msg) {
                    console.log(`Relaying NetworkTransferStatus Failed. Cannot find message with receiptId. networkId: ${net.networkId}, receiptId: ${receiptId}`);
                    return;
                }
                // Update message status
                msg.status = status;
                await result.client.set(`network_${net.networkId}`, arr);

                // Print the details to console
                console.log("NetworkTransferStatus received: ", msg, " status: ", status);
                
                // get the target network handler from the config
                // and relay the event to the target network
                var sourceNetwork = networks.find(network => network.id == msg.fromNetworkId);
                if(sourceNetwork){
                    await sourceNetwork.gatewayContract.confirmTransfer(receiptId);
                } else {
                    console.log("Relaying NetworkTransferStatus Failed. Cannot find the sourceNetwork. fromNetworkId: ", msg.fromNetworkId);
                }
            }
        );
    }

    // Iterate all configuration to set up event listeners and forward them to target networks
    const configuredNetworks = await Promise.all(networks.map((net) => networks.push(configureNetwork(net))));

    return configuredNetworks;
}

module.exports = { configureNetworks };

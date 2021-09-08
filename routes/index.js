const express = require('express');
const render = require('../render');
var router = express.Router();
const { createClient } = require("redis");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({'status': 'OK'});
});

async function getMessages(networkId) {
    const client = createClient();
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    return await client.get(`network_${networkId}`);
}

/* GET redis messages with NetworkId */
router.get('/:id', async function(req, res, next) {
    res.json(await getMessages(req.params.id));
});

module.exports = router;

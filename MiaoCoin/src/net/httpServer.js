const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const BlockChain = require('../blockchain/blockchain')
const {P2P} = require('./p2p')
const cors = require('cors');

class HttpServer {
    constructor(port,node) {
        this.node = node
        this.blockchain = node.blockchain
        this.p2p = node.p2p

        this.port = port

        this.app = express()
        // 允许所有来源（开发阶段）
        this.app.use(cors());

        
        this.app.use(bodyParser.json())

        this.app.set('views', './views')
        this.app.set('view engine', 'pug')
        this.app.get('/blocks', (req, res) => {
            res.send(this.blockchain.blocks);
        })
        this.app.get('/block/:hash', (req, res) => {
            const hash = req.params.hash
            const block = this.blockchain.getBlockByHash(hash)
            if (!block) {
                return res.status(404).send('Block not found')
            }
            res.send(block)
        })
        // 
        this.app.get('/transaction/:id', (req, res) => {
            const id = req.params.id
            const tx = this.blockchain.getTransactionByID(id)
            res.send(tx)
        })
        this.app.get('/address/:address', (req, res) => {
            const myUtxout = this.blockchain.uTxouts.filter((utxout) => {
                return utxout.address === req.params.address
            })
            res.send({'utxouts':myUtxout})

        })
        // 
        this.app.get('/mineBlock', (req, res) => {
            const newBlock = blockchain.generateNextBlock('test')
            res.send(newBlock)
        })
        this.app.get('/peers', (req,res) => {
            res.send(this.p2p.sockets.map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort))
        })
        this.app.post('/addPeer', (req, res) => {
            const peer = req.body.peer
            console.log(`post Connecting to ${peer}`);
            this.p2p.connectPeer(peer)
            res.send('Connected to peer')
        })
        this.app.post('/mineTransactionWithTransfer', (req,res) => {
            const senderAddress = req.body.senderAddress;
            const recipientAddress = req.body.recipientAddress;
            const amount = req.body.amount;
            const resp = this.blockchain.generateNextBlockWithTransaction(senderAddress,recipientAddress, amount);
            res.send(resp);
        })
        this.app.get('/mineTransactionWithPool', (req,res) => {
            const resp = this.blockchain.generateNextBlockWithPool();
            res.send(resp);
        })
        this.app.post('/sendTransaction',(req,res) => {
            const address = req.body.address;
            const amount = req.body.amount;
            const tx = this.blockchain.generateTransactionToPool(address,amount);
            this.node.broadcastTransactionPool()
            res.send(tx)
        })
        this.app.post('/wallet',(req, res)=> {
            const address = req.body.address;

            res.send( {
                'address':address,
                'balance':this.blockchain.getBalance(address)
            })
        })
        this.app.get('/getTransactionHistory',(req,res) => {
            res.send(this.blockchain.getTransactionHistory())
        })
        this.listen('0.0.0.0', this.port)
    }
    
    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on : http://${host}:${port}`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }
}

module.exports = HttpServer;


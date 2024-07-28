const {createHash, randomBytes, generateKeyPairSync,createSign, randomInt} = require('crypto');

class MiaoCrypto {
    static hash(data) {
        const hash = createHash('sha256')
            .update(data)
            .digest('hex');
        return hash;
    }

    static randomId(size = 64) {
        return randomBytes(Math.floor(size / 2)).toString('hex');
    }

    static randomInt(min, max){
        return randomInt(2,5)
    }

    static sign(data, privateKey) {
        const signer = createSign('SHA256');
        signer.update(data).end(); // 提供签名数据并结束输入
        return signer.sign(privateKey, 'hex');
    }
    static generateKeyPair() {
        const {privateKey, publicKey} = generateKeyPairSync('ec',{
            namedCurve: 'secp256k1', // 和 elliptic 库中的曲线相同
            publicKeyEncoding: {
                type: 'spki', // 编码格式
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        })
        return {privateKey, publicKey};
    }
    static pemToHex(pem) {
        const pemStr = pem.toString();
        const stripped = pemStr.replace(/-----BEGIN .*-----/, '').replace(/-----END .*-----/, '').replace(/\s/g, '');
        // 将 Base64 编码的内容解码为 Buffer
        const buffer = Buffer.from(stripped, 'base64');
        // 将 Buffer 转换为 Hex 字符串
        return buffer.toString('hex');
    }
}
console.log(MiaoCrypto.pemToHex(MiaoCrypto.generateKeyPair().publicKey))
console.log(MiaoCrypto.pemToHex(MiaoCrypto.generateKeyPair().publicKey))
console.log(MiaoCrypto.pemToHex(MiaoCrypto.generateKeyPair().publicKey))

module.exports = MiaoCrypto
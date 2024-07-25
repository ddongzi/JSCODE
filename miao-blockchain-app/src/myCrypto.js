class MyCrypto {
    static async hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return MyCrypto.bufferToHex(hashBuffer);
    }

    static randomId(size = 64) {
        const array = new Uint8Array(size / 2);
        crypto.getRandomValues(array);
        return MyCrypto.bufferToHex(array);
    }

    static async sign(data, privateKey) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const key = await MyCrypto.importPrivateKey(privateKey);
        const signature = await crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: { name: 'SHA-256' }
            },
            key,
            dataBuffer
        );
        return MyCrypto.bufferToHex(signature);
    }

    static async generateKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            true,
            ['sign', 'verify']
        );
        const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        return {
            privateKey: MyCrypto.bufferToPem(privateKey, 'PRIVATE KEY'),
            publicKey: MyCrypto.bufferToPem(publicKey, 'PUBLIC KEY')
        };
    }

    static async importPrivateKey(pem) {
        const keyBuffer = MyCrypto.pemToBuffer(pem);
        console.log(`key buffer: ${keyBuffer}`)
        return await crypto.subtle.importKey(
            'pkcs8',
            keyBuffer,
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            true,
            ['sign']
        );
    }

    static pemToHex(pem) {
        const keyBuffer = MyCrypto.pemToBuffer(pem);
        return MyCrypto.bufferToHex(keyBuffer);
    }

    static pemToBuffer(pem) {
        const stripped = pem.replace(/-----BEGIN .*-----/, '').replace(/-----END .*-----/, '').replace(/\s/g, '');
        // 将 Base64 编码的内容解码为 Buffer
        console.log(`Base64 ${stripped}`)
        return Uint8Array.from(atob(stripped), c => c.charCodeAt(0));
    }

    static bufferToHex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    static bufferToPem(buffer, label) {
        const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const pemString = `-----BEGIN ${label}-----\n${base64String.match(/.{1,64}/g).join('\n')}\n-----END ${label}-----`;
        return pemString;
    }
}

// // 使用示例
// (async () => {
//     // 生成散列
//     const hash = await MyCrypto.hash('Hello, world!');
//     console.log('Hash:', hash);

//     // 生成随机ID
//     const randomId = MyCrypto.randomId();
//     console.log('Random ID:', randomId);

//     // 生成密钥对
//     const { privateKey, publicKey } = await MyCrypto.generateKeyPair();
//     console.log('Private Key:', privateKey);
//     console.log('Public Key:', publicKey);

//     // 签名数据
//     const signature = await MyCrypto.sign('Hello, world!', privateKey);
//     console.log('Signature:', signature);

//     // PEM转Hex
//     const hex = MyCrypto.pemToHex(privateKey);
//     console.log('PEM to Hex:', hex);
// })();

export default MyCrypto;

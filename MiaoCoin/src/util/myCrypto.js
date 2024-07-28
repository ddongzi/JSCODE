// MyCrypto
const {webcrypto} = require('crypto');
class MyCrypto {
    static async hash(data) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await webcrypto.subtle.digest("SHA-256", dataBuffer);
      return MyCrypto.bufferToHex(hashBuffer);
    }
  
    static randomId(size = 64) {
      const array = new Uint8Array(size / 2);
      webcrypto.getRandomValues(array);
      return MyCrypto.bufferToHex(array);
    }
  
    static async sign(data, privateKey) {
      const encoder = new TextEncoder();
      console.log(`sign 1`);
      const dataBuffer = encoder.encode(data);
      console.log(`sign 2`);
  
      const key = await MyCrypto.importPrivateKey(privateKey);
      console.log(`sign 3`);
  
      const signature = await webcrypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        },
        key,
        dataBuffer
      );
      return MyCrypto.bufferToHex(signature);
    }
  
    static async generateKeyPair() {
      const keyPair = await webcrypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true,
        ["sign", "verify"]
      );
      const privateKey = await webcrypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );
      const publicKey = await webcrypto.subtle.exportKey("spki", keyPair.publicKey);
      return {
        privateKey: MyCrypto.bufferToPem(privateKey, "PRIVATE KEY"),
        publicKey: MyCrypto.bufferToPem(publicKey, "PUBLIC KEY"),
      };
    }
    static hexToArrayBuffer(hex) {
      // 计算字节数（每两个hex字符代表一个字节）
      const length = hex.length / 2;
      // 创建 Uint8Array 来存储转换后的字节
      const arrayBuffer = new Uint8Array(length);
      // 遍历 hex 字符串，每两个字符解析为一个字节
      for (let i = 0; i < length; i++) {
        const byteValue = parseInt(hex.substr(i * 2, 2), 16);
        arrayBuffer[i] = byteValue;
      }
      // 返回 ArrayBuffer
      return arrayBuffer.buffer;
    }
    static async importPrivateKey(pem) {
      const keyBuffer = MyCrypto.pemToBuffer(pem)
      var importKey  =''
      try {
          importKey= await webcrypto.subtle.importKey(
              "pkcs8",
              keyBuffer,
              {
                name: "ECDSA",
                namedCurve: "P-256",
              },
              true,
              ["sign"]
            );
      } catch (error) {
          console.log(error)
      }
      console.log("importKey result:", importKey);
      return importKey;
    }
  
    static pemToHex(pem) {
      const keyBuffer = MyCrypto.pemToBuffer(pem);
      return MyCrypto.bufferToHex(keyBuffer);
    }
  
    
    static pemToBuffer(pem) {
      const stripped = pem
        .replace(/-----BEGIN .*-----/, "")
        .replace(/-----END .*-----/, "")
        .replace(/\s/g, "");
      // 将 Base64 编码的内容解码为 Buffer
      return Uint8Array.from(atob(stripped), (c) => c.charCodeAt(0));
    }
  
    static bufferToHex(buffer) {
      return Array.prototype.map
        .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
    }
  
    static bufferToPem(buffer, label) {
      const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const pemString = `-----BEGIN ${label}-----\n${base64String}\n-----END ${label}-----`;
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
  
module.exports = MyCrypto  
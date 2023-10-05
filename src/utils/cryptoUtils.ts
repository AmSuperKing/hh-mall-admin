import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import JsRsaSign from "jsrsasign";

/**
 * RSA加密
 * @param {String} publicKey 公钥
 * @param {String} plainText 明文
 * @returns {*} 密文
 */
export function encryptByRSA(publicKey: string, plainText: string) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(plainText);
}

/**
 * RSA解密
 * @param {String} privateKey 私钥
 * @param {String} cipherText 密文
 * @returns {*} 明文
 */
export function decryptByRSA(privateKey: string, cipherText: string) {
  const decrypter = new JSEncrypt();
  decrypter.setPrivateKey(privateKey);
  return decrypter.decrypt(cipherText);
}

/**
 * 生成RSA密钥对，填充模式为PKCS8。
 * 更多模式参考：<a href="https://kjur.github.io/jsrsasign/api/symbols/KEYUTIL.html">https://kjur.github.io/jsrsasign/api/symbols/KEYUTIL.html</a>
 * @returns {{privateKey: (string|string|*), publicKey: (string|string|*)}}
 */
export function generateRsaKeyWithPKCS8() {
  const keyPair = JsRsaSign.KEYUTIL.generateKeypair("RSA", 1024);
  const privateKey = JsRsaSign.KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS8PRV");
  const publicKey = JsRsaSign.KEYUTIL.getPEM(keyPair.pubKeyObj);
  return { privateKey, publicKey };
}

/**
 * SHA256和RSA加签
 * @param {String} privateKey 私钥
 * @param {String} msg 加签内容
 * @returns {string} Base64编码签名内容
 */
export function signBySHA256WithRSA(privateKey: string, msg: string) {
  const key = JsRsaSign.KEYUTIL.getKey(privateKey);
  const signature = new JsRsaSign.KJUR.crypto.Signature({
    alg: "SHA256withRSA",
  });
  signature.init(key);
  signature.updateString(msg);
  // 签名后的为16进制字符串，这里转换为16进制字符串
  return JsRsaSign.hextob64(signature.sign());
}

/**
 * SHA256和RSA验签
 * @param {String} publicKey 公钥：必须为标准pem格式。如果是PKCS1格式，必须包含-----BEGIN RSA PRIVATE KEY-----，如果是PKCS8格式，必须包含-----BEGIN PRIVATE KEY-----
 * @param {String} base64SignStr Base64编码签名字符串
 * @param {String} msg 原内容
 * @returns {boolean} 是否验签通过
 */
export function verifyBySHA256WithRSA(publicKey: string, base64SignStr: string, msg: string) {
  const key = JsRsaSign.KEYUTIL.getKey(publicKey);
  const signature = new JsRsaSign.KJUR.crypto.Signature({
    alg: "SHA256withRSA",
  });
  signature.init(key);
  signature.updateString(msg);
  // 需要将Base64进制签名字符串转换成16进制字符串
  return signature.verify(JsRsaSign.b64tohex(base64SignStr));
}

/**
 * MD5盐值加密
 * @param {String} saltKey 盐值
 * @param {String} plainText 明文
 * @returns {String} 密文
 */
export function md5Encrypt(saltKey: string, plainText: string) {
  let ciphertext = ''
  ciphertext = CryptoJS.AES.encrypt(plainText, saltKey).toString()
  return ciphertext
}

/**
 * 
 * @param {String} saltKey 盐值
 * @param {String} cipherText 密文 
 * @returns {String} 明文
 */
export function md5Decrypt(saltKey: string, cipherText: string) {
  let decryptedData = ''
  const bytes  = CryptoJS.AES.decrypt(cipherText, saltKey);
  decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  return decryptedData
}

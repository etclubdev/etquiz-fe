import { AES, enc } from "crypto-js";
export const SECRET_KEY_CRYPTO = import.meta.env.VITE_ENCRYPT_KEY || "defaultKey";

export const encryptData = (data: any) => {
  return btoa(AES.encrypt(JSON.stringify(data), SECRET_KEY_CRYPTO).toString());
};
export const decryptData = (data: any) => {
  const decryptedBytes = AES.decrypt(atob(data), SECRET_KEY_CRYPTO);
  return decryptedBytes.toString(enc.Utf8);
};

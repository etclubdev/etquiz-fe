import { useState } from "react";
import { AES, enc } from "crypto-js";
import { SECRET_KEY_CRYPTO } from "../utils/encryptData";
export const LocalStorageEventTarget = new EventTarget();

function useLocalStorage(key: string) {
  // Retrieve and decrypt the data from localStorage if it exists
  const getStoredValue = () => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        const decryptedBytes = AES.decrypt(atob(storedValue), SECRET_KEY_CRYPTO);
        return JSON.parse(decryptedBytes.toString(enc.Utf8));
      } catch (error) {
        console.error("Failed to decrypt or parse stored data:", error);
        return null;
      }
    }
    return null;
  };

  const [storedData, setStoredData] = useState(getStoredValue);

  // Function to set data in localStorage (with encryption)
  const setValue = (value: any) => {
    try {
      const encryptedValue = btoa(AES.encrypt(JSON.stringify(value), SECRET_KEY_CRYPTO).toString());
      localStorage.setItem(key, encryptedValue);
      setStoredData(value);
      setTimeout(() => {
        const clearLSEvent = new Event("setValue");
        LocalStorageEventTarget.dispatchEvent(clearLSEvent);
      }, 0);
    } catch (error) {
      console.error("Failed to encrypt and store data:", error);
    }
  };

  // Function to remove data from localStorage
  const reset = () => {
    localStorage.removeItem("studentInfo");
    localStorage.removeItem("questions");
    localStorage.removeItem("answers");
    setTimeout(() => {
      const clearLSEvent = new Event("reset");
      LocalStorageEventTarget.dispatchEvent(clearLSEvent);
    }, 0);
  };

  return { storedData, setValue, reset, getStoredValue };
}

export default useLocalStorage;

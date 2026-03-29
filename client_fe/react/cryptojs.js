import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CRYPTO_JS_SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('VITE_CRYPTO_JS_SECRET_KEY is not defined');
}

const cryptoUtils = {
    // Mã hóa dữ liệu (Giống Backend)
    encrypt: (text) => {
        const data = typeof text === 'object' ? JSON.stringify(text) : text;
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    },

    // Giải mã dữ liệu (Giống Backend)
    decrypt: (ciphertext) => {
        try {
            if (!ciphertext) return {};

            // Thay thế khoảng trắng bằng dấu '+' (lỗi phổ biến khi truyền qua URL)
            const formattedCiphertext = ciphertext.toString().replace(/ /g, '+');

            const bytes = CryptoJS.AES.decrypt(formattedCiphertext, SECRET_KEY);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) {
                console.error('Decryption failed: Empty result (possibly wrong key or corrupted data)');
                return {};
            }

            try {
                return JSON.parse(decryptedText);
            } catch (e) {
                return decryptedText;
            }
        } catch (error) {
            console.error('CryptoJS Decrypt Error:', error.message);
            return {};
        }
    }
};

export default cryptoUtils;
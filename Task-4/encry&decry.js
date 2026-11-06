const crypto = require('crypto');
const readline = require('readline');

function caesarCipher(text, shift, decrypt = false) {
    if (decrypt) shift = (26 - shift) % 26;
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const base = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
    }).join('');
}

function encryptAES(text, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encryptedText = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return {
        encryptedText,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        authTag: cipher.getAuthTag().toString('hex')
    };
}

function decryptAES(encryptedData, password) {
    try {
        const key = crypto.pbkdf2Sync(password, Buffer.from(encryptedData.salt, 'hex'), 100000, 32, 'sha256');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encryptedData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        return decipher.update(encryptedData.encryptedText, 'hex', 'utf8') + decipher.final('utf8');
    } catch (e) {
        return "Decryption failed! Incorrect password or corrupted data.";
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function runInterface() {
    console.log("\n=== Encryption & Decryption Toolkit ===");
    console.log("1. Caesar Cipher (Classical)");
    console.log("2. AES-256 Encryption (Modern)");
    console.log("3. Explain Cryptography Strengths/Weaknesses");
    console.log("4. Exit");
    
    rl.question("\nSelect an option (1-4): ", (choice) => {
        if (choice === '1') {
            rl.question("Enter text for Caesar Cipher: ", (text) => {
                rl.question("Enter shift number (e.g., 3): ", (shiftStr) => {
                    const shift = parseInt(shiftStr) || 0;
                    const encrypted = caesarCipher(text, shift);
                    console.log(`\nEncrypted: ${encrypted}`);
                    console.log(`Decrypted: ${caesarCipher(encrypted, shift, true)}`);
                    runInterface();
                });
            });
        } else if (choice === '2') {
            rl.question("Enter text to secure with AES: ", (text) => {
                rl.question("Enter a strong passphrase: ", (password) => {
                    const encryptedData = encryptAES(text, password);
                    console.log(`\nEncrypted Hex: ${encryptedData.encryptedText}`);
                    
                    rl.question("\nEnter the passphrase to decrypt: ", (verifyPass) => {
                        const decrypted = decryptAES(encryptedData, verifyPass);
                        console.log(`Decrypted Text: ${decrypted}`);
                        runInterface();
                    });
                });
            });
        } else if (choice === '3') {
            console.log("\n--- Comparison ---");
            console.log("Classical Ciphers (like Caesar) are highly vulnerable to brute-force and frequency analysis attacks. They are useful for understanding cryptographic concepts but offer zero real-world security.");
            console.log("Modern Ciphers (like AES) utilize massive key spaces and advanced mathematics (substitution-permutation networks). When combined with securely derived keys (PBKDF2), they are practically unbreakable by current technology.");
            runInterface();
        } else {
            console.log("Exiting toolkit.");
            rl.close();
        }
    });
}

runInterface();
function checkPassword(password){
    const blocklist = ['password', '123456', 'admin', 'qwerty', 'letmein', 'welcome'];
    if (blocklist.includes(password.toLowerCase())) {
        return { rating: "Weak", feedback: "Your password is too common.", crackTime: "Instantly" };
    }

const lengthOk = password.length >= 8;
const upperOk = /[A-Z]/.test(password);
const lowerOk = /[a-z]/.test(password);
const digitOk = /[0-9]/.test(password);
const symbolOk = /[!@#$%^&*(),.?":{}|<>]/.test(password);

const score = [lengthOk, upperOk, digitOk, symbolOk].filter(Boolean).length;

const feedback = [];
if (!lengthOk) feedback.push("-- Password must be at least 8 characters long.");
if (!upperOk) feedback.push("-- Password must contain at least one uppercase letter.");
if (!lowerOk) feedback.push("-- Password must contain at least one lowercase letter.");
if (!digitOk) feedback.push("-- Password must contain at least one digit.");
if (!symbolOk) feedback.push("-- Password must contain at least one special character.");

let poolSize = 0;
if (lowerOk) poolSize +=26;
if (upperOk) poolSize +=26;
if (digitOk) poolSize +=10;
if (symbolOk) poolSize +=32; 
if (poolSize === 0) poolSize = 1;

const entropy = password.length * Math.log2(poolSize);
const guessPerSecond = Math.pow(10, 9);
const timeToCrackSeconds = Math.pow(2, entropy);

let rating = "Strong";
if (score < 3) rating = "Weak";
else if (score < 5) rating = "Medium";
let formattedCrackTime;
if (timeToCrackSeconds < 60) {
    formattedCrackTime = `${Math.round(timeToCrackSeconds)} seconds`;
} else if (timeToCrackSeconds < 3600) {
    formattedCrackTime = `${Math.round(timeToCrackSeconds / 60)} minutes`;
} else if (timeToCrackSeconds < 86400) {
    formattedCrackTime = `${Math.round(timeToCrackSeconds / 3600)} hours`;
} else if (timeToCrackSeconds < 31536000) {
    formattedCrackTime = `${Math.round(timeToCrackSeconds / 86400)} days`;
} else {
    formattedCrackTime = `${Math.round(timeToCrackSeconds / 31536000).toLocaleString()} years`;
}
return {
    rating,
    crackTime: formattedCrackTime,
     feedback: feedback.length ? feedback.join("\n") : "Great password!"
};
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter a password to check: ', (userInput) => {
    const result = checkPassword(userInput);
    console.log('\n--- Password Evaluation ---');
    console.log(`Rating:      ${result.rating}`);
    console.log(`Crack Time:  ${result.crackTime}`);
    console.log(`Feedback:\n${result.feedback}`);    
    rl.close();
});

const readline = require('readline');

const dataset = [
    { url: "https://www.google.com", isPhishing: false, domainAgeDays: 9000 },
    { url: "https://github.com/login", isPhishing: false, domainAgeDays: 5500 },
    { url: "http://secure-login-update.com@192.168.1.1", isPhishing: true, domainAgeDays: 2 },
    { url: "https://my-bank-update.info/login", isPhishing: true, domainAgeDays: 5 },
    { url: "http://free-prizes-click-here.biz/claim?user=123&token=abc", isPhishing: true, domainAgeDays: 10 }
];

function extractFeatures(url, domainAgeDays) {
    return {
        hasAtSymbol: url.includes('@'),
        isHttps: url.startsWith('https://'),
        isLong: url.length > 75,
        isYoungDomain: domainAgeDays < 30 
    };
}

let modelWeights = { hasAtSymbol: 0, noHttps: 0, isLong: 0, isYoungDomain: 0 };

function trainModel(data) {
    console.log("Gathering dataset and training simple classification model...");
    data.forEach(item => {
        const features = extractFeatures(item.url, item.domainAgeDays);
        if (item.isPhishing) {
            if (features.hasAtSymbol) modelWeights.hasAtSymbol += 30;
            if (!features.isHttps) modelWeights.noHttps += 25;
            if (features.isLong) modelWeights.isLong += 15;
            if (features.isYoungDomain) modelWeights.isYoungDomain += 30;
        }
    });
    console.log("Model trained successfully.\n");
}

trainModel(dataset);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function assessRisk(url) {
    const simulatedDomainAge = Math.floor(Math.random() * 500); 
    const features = extractFeatures(url, simulatedDomainAge);
    
    let riskScore = 0;
    if (features.hasAtSymbol) riskScore += modelWeights.hasAtSymbol;
    if (!features.isHttps) riskScore += modelWeights.noHttps;
    if (features.isLong) riskScore += modelWeights.isLong;
    if (features.isYoungDomain) riskScore += modelWeights.isYoungDomain;

    let assessment = "Low Risk (Likely Legitimate)";
    if (riskScore >= 50) assessment = "High Risk (Likely Phishing)";
    else if (riskScore > 20) assessment = "Medium Risk";

    console.log(`\n--- Phishing Risk Assessment ---`);
    console.log(`URL Checked: ${url}`);
    console.log(`Simulated Domain Age: ${simulatedDomainAge} days`);
    console.log(`Risk Score: ${riskScore}`);
    console.log(`Verdict: ${assessment}`);
}

function showLimitations() {
    console.log("\n--- Model Evaluation & Limitations ---");
    console.log("1. WHOIS Dependency: Real domain age extraction requires paid or rate-limited WHOIS APIs. This tool simulates that specific feature.");
    console.log("2. Evasion Tactics: Modern phishing sites frequently use HTTPS (via free Let's Encrypt certificates), completely bypassing the 'no HTTPS' rule.");
    console.log("3. Unseen Patterns: This basic feature-based model cannot detect legitimate domains that have been recently compromised by attackers, as the URL length and domain age will appear completely normal.");
    console.log("--------------------------------------\n");
}

rl.question("Paste a URL to check its phishing risk: ", (userInput) => {
    assessRisk(userInput);
    showLimitations();
    rl.close();
});
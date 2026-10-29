const net = require('net');

function checkPort(port, host) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => { socket.destroy(); resolve(true); });
        socket.on('timeout', () => { socket.destroy(); resolve(false); });
        socket.on('error', () => { resolve(false); });
        socket.connect(port, host);
    });
}

async function scanPorts(targetIp, ports) {
    const services = { 21: "FTP", 22: "SSH", 80: "HTTP", 443: "HTTPS", 3306: "MySQL" };
    for (const port of ports) {
        if (await checkPort(port, targetIp)) {
            console.log(`Port ${port} is OPEN (${services[port] || "Unknown"})`);
        } else{
            console.log(`Port ${port} is CLOSED (${services[port] || "Unknown"})`);
        }
    }
    console.log("\nSummary: Open ports are essential for services but expose entry points for attackers. Monitoring them reduces the attack surface.");
}
scanPorts('127.0.0.1', [21, 22, 80, 135, 443, 445, 3306]);
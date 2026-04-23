async function fetchLogs() {
    try {
        const response = await fetch(`${API_URL}/logs/${USER_ID}`);
        const data = await response.json();
        populateLogs(data.logs);
        if (data.logs.length > 0) {
            const latest = data.logs[0];
            updateHUD(latest.risk_score, latest.status);
        }
    } catch (err) {
        console.error("Failed to fetch logs", err);
    }
}

function updateHUD(score, status) {
    const riskEl = document.getElementById('risk-score');
    const threatCount = document.getElementById('threat-count');
    const defenseStatus = document.getElementById('defense-status');
    const blipContainer = document.getElementById('blip-container');
    const emergencyModal = document.getElementById('emergency-modal');
    
    riskEl.innerText = score.toFixed(2) + '%';
    blipContainer.innerHTML = ''; 
    
    // Emergency Popup Rule (> 80)
    if (score > 80) {
        emergencyModal.style.display = 'flex';
    }

    if (score >= 40) {
        document.body.classList.add('emergency');
        threatCount.innerText = "02 DETECTED";
        threatCount.style.color = "var(--danger-color)";
        defenseStatus.innerText = "ACTIVE";
        defenseStatus.style.color = "var(--primary-color)";
        
        // Add active blips
        blipContainer.innerHTML = `
            <div class="blip" style="top: 30%; left: 70%; animation-delay: 1s;"></div>
            <div class="blip" style="top: 65%; left: 25%; animation-delay: 2s;"></div>
        `;
    } else {
        document.body.classList.remove('emergency');
        threatCount.innerText = "00 DETECTED";
        threatCount.style.color = "var(--primary-color)";
        defenseStatus.innerText = "INACTIVE";
        defenseStatus.style.color = "var(--text-muted)";
    }
}

function populateLogs(logs) {
    const logList = document.getElementById('log-list');
    logList.innerHTML = '';
    
    logs.slice(0, 8).forEach(log => {
        const isAlert = log.status !== 'SAFE';
        const entry = document.createElement('div');
        entry.className = `log-entry ${isAlert ? 'alert' : ''}`;
        
        const time = log.timestamp.split('T')[1].split('.')[0];
        
        entry.innerHTML = `
            <span class="timestamp">[${time}]</span>
            <span class="message">${log.status} - Score: ${log.risk_score.toFixed(2)}%</span>
        `;
        logList.appendChild(entry);
    });
}

async function triggerAction(isAttack) {
    console.log(isAttack ? "Simulating attack..." : "Running normal scan...");
    const telemetry = {
        battery: isAttack ? 25.0 : 85.0,
        network: isAttack ? 88.0 : 5.0,
        mic: isAttack ? 0.9 : 0.01,
        permission_risk: isAttack ? 0.85 : 0.1,
        night_mode: false
    };

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telemetry)
        });
        const result = await response.json();
        fetchLogs(); // Refresh immediately
    } catch (err) {
        console.error("Action failed", err);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLogs();
    
    document.getElementById('btn-normal').addEventListener('click', () => triggerAction(false));
    document.getElementById('btn-simulate').addEventListener('click', () => triggerAction(true));
    
    setInterval(fetchLogs, 5000); // Polling
    console.log("ShadowTrace Web Console Initialized.");
});

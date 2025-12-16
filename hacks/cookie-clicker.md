---
layout: opencs
title: Cookie Clicker
permalink: /Cookie-Clicker/
---
<script src="https://cdn.tailwindcss.com"></script>

<div class="grid grid-cols-4 gap-4 h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
    <!-- SHOP Section -->
    <div class="col-span-1 p-4 shadow-lg border-8 border-double border-yellow-800 bg-yellow-100 rounded-xl flex flex-col gap-2 overflow-y-auto">
        <div class="text-xl font-bold mb-4 text-center text-yellow-900">🏪 SHOP</div>
        
        <button id="btn-cursor" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🖱️ Cursor</div>
            <div class="text-sm" id="cost-cursor">Cost: 10</div>
            <div class="text-xs" id="count-cursor">Owned: 0</div>
        </button>

        <button id="btn-grandma" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">👵 Grandma</div>
            <div class="text-sm" id="cost-grandma">Cost: 20</div>
            <div class="text-xs" id="count-grandma">Owned: 0</div>
        </button>

        <button id="btn-factory" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🏭 Factory</div>
            <div class="text-sm" id="cost-factory">Cost: 500</div>
            <div class="text-xs" id="count-factory">Owned: 0</div>
        </button>

        <button id="btn-bank" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🏦 Bank</div>
            <div class="text-sm" id="cost-bank">Cost: 6000</div>
            <div class="text-xs" id="count-bank">Owned: 0</div>
        </button>

        <button id="btn-temple" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">⛪ Mango Temple</div>
            <div class="text-sm" id="cost-temple">Cost: 50000</div>
            <div class="text-xs" id="count-temple">Owned: 0</div>
        </button>

        <button id="btn-ohio" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">⏳ Chaotic Ohio</div>
            <div class="text-sm" id="cost-ohio">Cost: 200000</div>
            <div class="text-xs" id="count-ohio">Owned: 0</div>
        </button>
    </div>

    <!-- GAME Section -->
    <div class="col-span-3 flex flex-col items-center justify-between p-4 bg-yellow-100 rounded-xl shadow-xl border-8 border-double border-yellow-800">
        <!-- Top section -->
        <div class="text-center">
            <div class="text-5xl font-extrabold text-yellow-900 drop-shadow-lg tracking-wide">
                🍪 Cookie Clicker
            </div>
            <div class="mt-2 text-2xl font-semibold text-yellow-900">
                Cookies: <span class="font-bold text-yellow-700" id="cookie-count">0</span>
            </div>
            <div class="mt-1 text-lg text-yellow-800">
                Per second: <span class="font-bold" id="cps-display">0.0</span>
            </div>
        </div>

        <!-- Middle section - Clickable Cookie -->
        <button id="cookie-button" class="w-48 h-48 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 ease-out flex items-center justify-center border-4 border-amber-600 text-8xl">
            🍪
        </button>

        <!-- Bottom section -->
        <div class="text-center bg-yellow-200/70 px-6 py-3 rounded-lg shadow border border-yellow-400">
            <span class="font-semibold text-yellow-900">
                Click the cookie to earn cookies! Buy upgrades to automate production.
            </span>
        </div>
    </div>
</div>

<script>
    // Game state
    let cookies = 0;
    const upgrades = {
        cursor: { count: 0, baseCost: 10, cps: 0.1 },
        grandma: { count: 0, baseCost: 700, cps: 1 },
        factory: { count: 0, baseCost: 5000, cps: 8 },
        bank: { count: 0, baseCost: 60000, cps: 47 },
        temple: { count: 0, baseCost: 500000, cps: 260 },
        ohio: { count: 0, baseCost: 2000000, cps: 1400 }
    };

    // Calculate current cost with scaling
    function getCurrentCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
    }

    // Calculate total cookies per second
    function getTotalCps() {
        return Object.values(upgrades).reduce((sum, upgrade) => 
            sum + (upgrade.count * upgrade.cps), 0
        );
    }

    // Update display
    function updateDisplay() {
        document.getElementById('cookie-count').textContent = Math.floor(cookies);
        document.getElementById('cps-display').textContent = getTotalCps().toFixed(1);

        // Update each upgrade button
        for (const [key, upgrade] of Object.entries(upgrades)) {
            const cost = getCurrentCost(upgrade);
            const button = document.getElementById(`btn-${key}`);
            
            document.getElementById(`cost-${key}`).textContent = `Cost: ${cost}`;
            document.getElementById(`count-${key}`).textContent = `Owned: ${upgrade.count}`;

            // Update button styles based on affordability
            if (cookies >= cost) {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-green-500 hover:bg-green-600 text-white';
                button.disabled = false;
            } else {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-gray-400 text-gray-200 cursor-not-allowed';
                button.disabled = true;
            }
        }
    }

    // Handle cookie click
    document.getElementById('cookie-button').addEventListener('click', () => {
        cookies += 1;
        updateDisplay();
    });

    // Handle upgrade purchases
    function buyUpgrade(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        const cost = getCurrentCost(upgrade);
        
        if (cookies >= cost) {
            cookies -= cost;
            upgrade.count += 1;
            updateDisplay();
        }
    }

    // Set up upgrade button listeners
    document.getElementById('btn-cursor').addEventListener('click', () => buyUpgrade('cursor'));
    document.getElementById('btn-grandma').addEventListener('click', () => buyUpgrade('grandma'));
    document.getElementById('btn-factory').addEventListener('click', () => buyUpgrade('factory'));
    document.getElementById('btn-bank').addEventListener('click', () => buyUpgrade('bank'));
    document.getElementById('btn-temple').addEventListener('click', () => buyUpgrade('temple'));
    document.getElementById('btn-ohio').addEventListener('click', () => buyUpgrade('ohio'));

    // Auto-generate cookies
    setInterval(() => {
        const totalCps = getTotalCps();
        if (totalCps > 0) {
            cookies += totalCps / 10; // Update every 100ms
            updateDisplay();
        }
    }, 100);

    // Initial display update
    updateDisplay();
</script>
// Load game state from storage or use defaults
    let cookies = 0;
    const upgrades = {
        cursor: { count: 0, baseCost: 10, cps: 0.1 },
        grandma: { count: 0, baseCost: 700, cps: 1 },
        factory: { count: 0, baseCost: 5000, cps: 8 },
        bank: { count: 0, baseCost: 60000, cps: 47 },
        temple: { count: 0, baseCost: 500000, cps: 260 },
        ohio: { count: 0, baseCost: 2000000, cps: 1400 }
    };

    // Load saved data
    async function loadGame() {
        try {
            const savedCookies = await window.storage.get('cookie_clicker_cookies');
            const savedUpgrades = await window.storage.get('cookie_clicker_upgrades');
            
            if (savedCookies && savedCookies.value) {
                cookies = parseFloat(savedCookies.value);
            }
            
            if (savedUpgrades && savedUpgrades.value) {
                const loaded = JSON.parse(savedUpgrades.value);
                for (const key in loaded) {
                    if (upgrades[key]) {
                        upgrades[key].count = loaded[key].count;
                    }
                }
            }
        } catch (error) {
            console.log('No saved game found or error loading:', error);
        }
        updateDisplay();
    }

    // Save game data
    async function saveGame() {
        try {
            await window.storage.set('cookie_clicker_cookies', cookies.toString());
            const upgradeData = {};
            for (const key in upgrades) {
                upgradeData[key] = { count: upgrades[key].count };
            }
            await window.storage.set('cookie_clicker_upgrades', JSON.stringify(upgradeData));
        } catch (error) {
            console.log('Error saving game:', error);
        }
    }

    // Calculate current cost with scaling
    function getCurrentCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
    }

    // Calculate total cookies per second
    function getTotalCps() {
        return Object.values(upgrades).reduce((sum, upgrade) => 
            sum + (upgrade.count * upgrade.cps), 0
        );
    }

    // Update display
    function updateDisplay() {
        document.getElementById('cookie-count').textContent = Math.floor(cookies);
        document.getElementById('cps-display').textContent = getTotalCps().toFixed(1);

        // Update each upgrade button
        for (const [key, upgrade] of Object.entries(upgrades)) {
            const cost = getCurrentCost(upgrade);
            const button = document.getElementById(`btn-${key}`);
            
            document.getElementById(`cost-${key}`).textContent = `Cost: ${cost}`;
            document.getElementById(`count-${key}`).textContent = `Owned: ${upgrade.count}`;

            // Update button styles based on affordability
            if (cookies >= cost) {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-green-500 hover:bg-green-600 text-white';
                button.disabled = false;
            } else {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-gray-400 text-gray-200 cursor-not-allowed';
                button.disabled = true;
            }
        }
    }

    // Handle cookie click
    document.getElementById('cookie-button').addEventListener('click', () => {
        cookies += 1;
        updateDisplay();
        saveGame();
    });

    // Handle upgrade purchases
    function buyUpgrade(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        const cost = getCurrentCost(upgrade);
        
        if (cookies >= cost) {
            cookies -= cost;
            upgrade.count += 1;
            updateDisplay();
            saveGame();
        }
    }

    // Set up upgrade button listeners
    document.getElementById('btn-cursor').addEventListener('click', () => buyUpgrade('cursor'));
    document.getElementById('btn-grandma').addEventListener('click', () => buyUpgrade('grandma'));
    document.getElementById('btn-factory').addEventListener('click', () => buyUpgrade('factory'));
    document.getElementById('btn-bank').addEventListener('click', () => buyUpgrade('bank'));
    document.getElementById('btn-temple').addEventListener('click', () => buyUpgrade('temple'));
    document.getElementById('btn-ohio').addEventListener('click', () => buyUpgrade('ohio'));

    // Auto-generate cookies
    setInterval(() => {
        const totalCps = getTotalCps();
        if (totalCps > 0) {
            cookies += totalCps / 10; // Update every 100ms
            updateDisplay();
        }
    }, 100);

    // Save game every 5 seconds
    setInterval(() => {
        saveGame();
    }, 5000);

    // Load game on start
    loadGame();
</script>
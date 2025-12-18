---
layout: opencs
title: Cookie Clicker
permalink: /Cookie-Clicker/
---
<script src="https://cdn.tailwindcss.com"></script>

<div id="cookie-game" class="grid grid-cols-4 gap-4 h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
    <div class="col-span-1 p-4 shadow-lg border-8 border-double border-yellow-800 bg-yellow-100 rounded-xl flex flex-col gap-2 overflow-y-auto">
        <div class="text-xl font-bold mb-4 text-center text-yellow-900">🏪 SHOP</div>
        
        <button id="btn-cursor" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🖱️ Cursor</div>
            <div class="text-sm" id="cost-cursor">Cost: 10</div>
            <div class="text-xs" id="count-cursor">Owned: 0</div>
        </button>

        <button id="btn-grandma" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">👵 Grandma</div>
            <div class="text-sm" id="cost-grandma">Cost: 700</div>
            <div class="text-xs" id="count-grandma">Owned: 0</div>
        </button>

        <button id="btn-factory" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🏭 Factory</div>
            <div class="text-sm" id="cost-factory">Cost: 5000</div>
            <div class="text-xs" id="count-factory">Owned: 0</div>
        </button>

        <button id="btn-bank" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">🏦 Bank</div>
            <div class="text-sm" id="cost-bank">Cost: 60000</div>
            <div class="text-xs" id="count-bank">Owned: 0</div>
        </button>

        <button id="btn-temple" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">⛪ Mango Temple</div>
            <div class="text-sm" id="cost-temple">Cost: 500000</div>
            <div class="text-xs" id="count-temple">Owned: 0</div>
        </button>

        <button id="btn-ohio" class="px-4 py-3 rounded shadow transition-all">
            <div class="font-bold">⏳ Chaotic Ohio</div>
            <div class="text-sm" id="cost-ohio">Cost: 2000000</div>
            <div class="text-xs" id="count-ohio">Owned: 0</div>
        </button>
    </div>

    <div class="col-span-3 flex flex-col items-center justify-between p-4 bg-yellow-100 rounded-xl shadow-xl border-8 border-double border-yellow-800">
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

        <button id="cookie-button" class="w-48 h-48 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 ease-out flex items-center justify-center border-4 border-amber-600 text-8xl">
            🍪
        </button>

        <div class="text-center bg-yellow-200/70 px-6 py-3 rounded-lg shadow border border-yellow-400">
            <span class="font-semibold text-yellow-900">
                Click the cookie to earn cookies! Buy upgrades to automate production.
            </span>
        </div>
    </div>
</div>

<script>
(function() {
    var cookies = 0;
    var upgrades = {
        cursor: { count: 0, baseCost: 10, cps: 0.1 },
        grandma: { count: 0, baseCost: 700, cps: 1 },
        factory: { count: 0, baseCost: 5000, cps: 8 },
        bank: { count: 0, baseCost: 60000, cps: 47 },
        temple: { count: 0, baseCost: 500000, cps: 260 },
        ohio: { count: 0, baseCost: 2000000, cps: 1400 }
    };

    function loadGame() {
        try {
            var savedCookies = localStorage.getItem('cookie_clicker_cookies');
            var savedUpgrades = localStorage.getItem('cookie_clicker_upgrades');
            
            if (savedCookies) {
                cookies = parseFloat(savedCookies);
            }
            
            if (savedUpgrades) {
                var loaded = JSON.parse(savedUpgrades);
                for (var key in loaded) {
                    if (upgrades[key]) {
                        upgrades[key].count = loaded[key].count;
                    }
                }
            }
        } catch (error) {
            console.log('No saved game found');
        }
        updateDisplay();
    }

    function saveGame() {
        try {
            localStorage.setItem('cookie_clicker_cookies', cookies.toString());
            var upgradeData = {};
            for (var key in upgrades) {
                upgradeData[key] = { count: upgrades[key].count };
            }
            localStorage.setItem('cookie_clicker_upgrades', JSON.stringify(upgradeData));
        } catch (error) {
            console.log('Error saving game');
        }
    }

    function getCurrentCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
    }

    function getTotalCps() {
        var total = 0;
        for (var key in upgrades) {
            total += upgrades[key].count * upgrades[key].cps;
        }
        return total;
    }

    function updateDisplay() {
        document.getElementById('cookie-count').textContent = Math.floor(cookies);
        document.getElementById('cps-display').textContent = getTotalCps().toFixed(1);

        for (var key in upgrades) {
            var upgrade = upgrades[key];
            var cost = getCurrentCost(upgrade);
            var button = document.getElementById('btn-' + key);
            
            document.getElementById('cost-' + key).textContent = 'Cost: ' + cost;
            document.getElementById('count-' + key).textContent = 'Owned: ' + upgrade.count;

            if (cookies >= cost) {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-green-500 hover:bg-green-600 text-white';
                button.disabled = false;
            } else {
                button.className = 'px-4 py-3 rounded shadow transition-all bg-gray-400 text-gray-200 cursor-not-allowed';
                button.disabled = true;
            }
        }
    }

    function buyUpgrade(upgradeKey) {
        var upgrade = upgrades[upgradeKey];
        var cost = getCurrentCost(upgrade);
        
        if (cookies >= cost) {
            cookies -= cost;
            upgrade.count += 1;
            updateDisplay();
            saveGame();
        }
    }

    document.getElementById('cookie-button').addEventListener('click', function() {
        cookies += 1;
        updateDisplay();
        saveGame();
    });

    document.getElementById('btn-cursor').addEventListener('click', function() { buyUpgrade('cursor'); });
    document.getElementById('btn-grandma').addEventListener('click', function() { buyUpgrade('grandma'); });
    document.getElementById('btn-factory').addEventListener('click', function() { buyUpgrade('factory'); });
    document.getElementById('btn-bank').addEventListener('click', function() { buyUpgrade('bank'); });
    document.getElementById('btn-temple').addEventListener('click', function() { buyUpgrade('temple'); });
    document.getElementById('btn-ohio').addEventListener('click', function() { buyUpgrade('ohio'); });

    setInterval(function() {
        var totalCps = getTotalCps();
        if (totalCps > 0) {
            cookies += totalCps / 10;
            updateDisplay();
        }
    }, 100);

    setInterval(function() {
        saveGame();
    }, 5000);

    loadGame();
})();
</script>
<button id="cookie-button" class="w-64 h-64 rounded-full cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 ease-out flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-full"></div>
            <div class="absolute inset-2 bg-gradient-to-br from-yellow-700 via-amber-500 to-yellow-600 rounded-full"></div>
            <div class="absolute inset-0 opacity-30">
                <div class="absolute w-8 h-8 bg-amber-800 rounded-full" style="top: 20%; left: 25%;"></div>
                <div class="absolute w-6 h-6 bg-amber-900 rounded-full" style="top: 35%; left: 65%;"></div>
                <div class="absolute w-7 h-7 bg-yellow-900 rounded-full" style="top: 60%; left: 30%;"></div>
                <div class="absolute w-5 h-5 bg-amber-800 rounded-full" style="top: 70%; left: 70%;"></div>
                <div class="absolute w-6 h-6 bg-yellow-800 rounded-full" style="top: 45%; left: 50%;"></div>
                <div class="absolute w-4 h-4 bg-amber-900 rounded-full" style="top: 25%; left: 75%;"></div>
                <div class="absolute w-5 h-5 bg-yellow-900 rounded-full" style="top: 80%; left: 45%;"></div>
                <div class="absolute w-6 h-6 bg-amber-800 rounded-full" style="top: 15%; left: 50%;"></div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-20 rounded-full"></div>
        </button>
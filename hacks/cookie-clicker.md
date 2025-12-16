---
layout: opencs
title: Cookie Clicker
permalink: /Cookie-Clicker/
---
import React, { useState, useEffect } from 'react';

export default function CookieClicker() {
  const [cookies, setCookies] = useState(0);
  const [upgrades, setUpgrades] = useState({
    cursor: { count: 0, baseCost: 15, cps: 0.1 },
    grandma: { count: 0, baseCost: 69, cps: 1 },
    factory: { count: 0, baseCost: 500, cps: 8 },
    bank: { count: 0, baseCost: 67410, cps: 47 },
    temple: { count: 0, baseCost: 50000, cps: 260 },
    ohio: { count: 0, baseCost: 6700000, cps: 1400 }
  });

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedCookies = localStorage.getItem('cookies');
    const savedUpgrades = localStorage.getItem('upgrades');
    
    if (savedCookies) setCookies(Number(savedCookies));
    if (savedUpgrades) setUpgrades(JSON.parse(savedUpgrades));
  }, []);

  // Save to localStorage whenever cookies or upgrades change
  useEffect(() => {
    localStorage.setItem('cookies', cookies.toString());
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
  }, [cookies, upgrades]);

  // Auto-generate cookies based on upgrades
  useEffect(() => {
    const totalCps = Object.values(upgrades).reduce((sum, upgrade) => 
      sum + (upgrade.count * upgrade.cps), 0
    );
    
    if (totalCps > 0) {
      const interval = setInterval(() => {
        setCookies(prev => prev + totalCps / 10);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [upgrades]);

  // Calculate current cost with scaling (1.15x multiplier per purchase)
  const getCurrentCost = (upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
  };

  // Handle cookie click
  const handleCookieClick = () => {
    setCookies(prev => prev + 1);
  };

  // Handle upgrade purchase
  const buyUpgrade = (upgradeKey) => {
    const upgrade = upgrades[upgradeKey];
    const cost = getCurrentCost(upgrade);
    
    if (cookies >= cost) {
      setCookies(prev => prev - cost);
      setUpgrades(prev => ({
        ...prev,
        [upgradeKey]: {
          ...prev[upgradeKey],
          count: prev[upgradeKey].count + 1
        }
      }));
    }
  };

  const totalCps = Object.values(upgrades).reduce((sum, upgrade) => 
    sum + (upgrade.count * upgrade.cps), 0
  );

  return (
    <div className="grid grid-cols-4 gap-4 h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      {/* SHOP Section */}
      <div className="col-span-1 p-4 shadow-lg border-8 border-double border-yellow-800 bg-yellow-100 rounded-xl flex flex-col gap-2 overflow-y-auto">
        <div className="text-xl font-bold mb-4 text-center text-yellow-900">🏪 SHOP</div>
        
        <button
          onClick={() => buyUpgrade('cursor')}
          disabled={cookies < getCurrentCost(upgrades.cursor)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.cursor)
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">🖱️ Cursor</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.cursor)}</div>
          <div className="text-xs">Owned: {upgrades.cursor.count}</div>
        </button>

        <button
          onClick={() => buyUpgrade('grandma')}
          disabled={cookies < getCurrentCost(upgrades.grandma)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.grandma)
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">👵 Grandma</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.grandma)}</div>
          <div className="text-xs">Owned: {upgrades.grandma.count}</div>
        </button>

        <button
          onClick={() => buyUpgrade('factory')}
          disabled={cookies < getCurrentCost(upgrades.factory)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.factory)
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">🏭 Factory</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.factory)}</div>
          <div className="text-xs">Owned: {upgrades.factory.count}</div>
        </button>

        <button
          onClick={() => buyUpgrade('bank')}
          disabled={cookies < getCurrentCost(upgrades.bank)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.bank)
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">🏦 Bank</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.bank)}</div>
          <div className="text-xs">Owned: {upgrades.bank.count}</div>
        </button>

        <button
          onClick={() => buyUpgrade('temple')}
          disabled={cookies < getCurrentCost(upgrades.temple)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.temple)
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">⛪ Mango Temple</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.temple)}</div>
          <div className="text-xs">Owned: {upgrades.temple.count}</div>
        </button>

        <button
          onClick={() => buyUpgrade('ohio')}
          disabled={cookies < getCurrentCost(upgrades.ohio)}
          className={`px-4 py-3 rounded shadow transition-all ${
            cookies >= getCurrentCost(upgrades.ohio)
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="font-bold">⏳ Chaotic Ohio</div>
          <div className="text-sm">Cost: {getCurrentCost(upgrades.ohio)}</div>
          <div className="text-xs">Owned: {upgrades.ohio.count}</div>
        </button>
      </div>

      {/* GAME Section */}
      <div className="col-span-3 flex flex-col items-center justify-between p-4 bg-yellow-100 rounded-xl shadow-xl border-8 border-double border-yellow-800">
        {/* Top section */}
        <div className="text-center">
          <div className="text-5xl font-extrabold text-yellow-900 drop-shadow-lg tracking-wide">
            🍪 Cookie Clicker
          </div>
          <div className="mt-2 text-2xl font-semibold text-yellow-900">
            Cookies: <span className="font-bold text-yellow-700">{Math.floor(cookies)}</span>
          </div>
          <div className="mt-1 text-lg text-yellow-800">
            Per second: <span className="font-bold">{totalCps.toFixed(1)}</span>
          </div>
        </div>

        {/* Middle section - Clickable Cookie */}
        <button
          onClick={handleCookieClick}
          className="w-48 h-48 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 ease-out flex items-center justify-center border-4 border-amber-600 text-8xl"
        >
          🍪
        </button>

        {/* Bottom section */}
        <div className="text-center bg-yellow-200/70 px-6 py-3 rounded-lg shadow border border-yellow-400">
          <span className="font-semibold text-yellow-900">
            Click the cookie to earn cookies! Buy upgrades to automate production.
          </span>
        </div>
      </div>
    </div>
  );
}
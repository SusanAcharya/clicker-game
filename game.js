// Game state
let currentLevel = 1;
const maxLevel = 5;
let bossHealth;
let maxBossHealth;
let playerStamina = 100;
let maxPlayerStamina = 100;
let tapDamage = 1;
let doubleDamageDuration = 2000;
let doubleDamageActive = false;
let tokens = 0;
let lastClickPosition = { x: 0, y: 0 };
let redZoneTimeout;
let greenZoneInterval;
let streakDays = 1;
let lastDailyRewardClaim = null;
let highestUnlockedLevel = 1;
let referralCode = '';
let cartelLevel = 0;
let weaponsShopLevel = 0;
let lastBoosterUpdate = Date.now();



// Upgrades
let tapDamageLevel = 0;
let staminaLevel = 0;
let doubleDamageDurationLevel = 0;

// DOM elements
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const upgradeScreen = document.getElementById('upgrade-screen');
const victoryScreen = document.getElementById('victory-screen');
const bossImage = document.getElementById('boss-image');
const bossHealthDisplay = document.getElementById('boss-health');
const staminaDisplay = document.getElementById('stamina');
const tokenCounter = document.getElementById('token-counter');
const levelDisplay = document.getElementById('level-display');
const rewardsSection = document.getElementById('rewards-section');
const bossContainer = document.getElementById('boss-container');



// Event listeners
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('upgrades').addEventListener('click', showUpgrades);
document.getElementById('back-to-menu').addEventListener('click', backToMainMenu);
document.getElementById('back-to-menu-upgrade').addEventListener('click', backToMainMenu);
document.getElementById('next-level').addEventListener('click', nextLevel);

document.querySelectorAll('.increase-level').forEach(button => {
    button.addEventListener('click', () => upgradestat(button.dataset.upgrade, 1));
});

document.querySelectorAll('.decrease-level').forEach(button => {
    button.addEventListener('click', () => upgradestat(button.dataset.upgrade, -1));
});

bossContainer.addEventListener('touchstart', handleTouchStart, false);
bossContainer.addEventListener('touchend', handleTouchEnd, false);
bossContainer.addEventListener('touchcancel', handleTouchEnd, false);

bossContainer.addEventListener('click', (e) => {
    const rect = bossContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createTapEffect(x, y);
    attackBoss(e);
});

let activeTouches = 0;

function handleTouchStart(e) {
    e.preventDefault();
    activeTouches = e.touches.length;
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = bossContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        createTapEffect(x, y);
    }
    attackBossMultiTouch();
}

function handleTouchEnd(e) {
    activeTouches = e.touches.length;
}

function attackBossMultiTouch() {
    if (playerStamina > 0) {
        let damage = tapDamage * activeTouches; // Multiply base damage by number of active touches
        if (doubleDamageActive) {
            damage *= 2; // Apply double damage after calculating multi-touch damage
        }
        bossHealth -= damage;
        playerStamina -= activeTouches; // Decrease stamina based on number of touches
        tokens += damage;
        
        if (bossHealth <= 0) {
            bossHealth = 0;
            showVictoryScreen();
        }
        
        updateDisplay();
    }
}

function showRewardsSection() {
    document.getElementById('rewards-section').style.display = 'block';
}

function hideRewardsSection() {
    document.getElementById('rewards-section').style.display = 'none';
}

function createTapEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    bossContainer.appendChild(effect);
    setTimeout(() => effect.remove(), 300);
}


function showDailyRewards() {
    const daysRewards = [50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 
                         5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 
                         10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000];
    
    const today = new Date().toDateString();
    if (lastDailyRewardClaim !== today) {
      const reward = daysRewards[Math.min(streakDays - 1, daysRewards.length - 1)];
      tokens += reward;
      alert(`You've claimed your daily reward of ${reward} tokens!`);
      lastDailyRewardClaim = today;
      streakDays++;
      updateDisplay();
    } else {
      alert("You've already claimed your daily reward today. Come back tomorrow!");
    }
  }
  
  // Add event listeners for the new elements
  document.querySelectorAll('.reward-card').forEach(card => {
    card.addEventListener('click', () => {
      alert("This feature is not implemented yet. Coming soon!");
    });
  });

  function backToMainMenu() {
    showMainMenu();
    showRewardsSection(); // Explicitly show rewards section
}
  
  document.getElementById('daily-rewards-btn').addEventListener('click', showDailyRewards);
  document.getElementById('back-to-menu-levels').addEventListener('click', backToMainMenu);

  document.querySelectorAll('.streak-task').forEach(task => {
    task.addEventListener('click', () => {
      alert("This feature is not implemented yet. Coming soon!");
    });
  });

  function startGame() {
    mainMenu.style.display = 'none';
    showLevelSelection();
    setupReferralCode();
    hideRewardsSection(); // Hide rewards section when starting the game
}

function showLevelSelection() {
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    levelSelectionScreen.style.display = 'block';
    const levelPath = document.getElementById('level-path');
    levelPath.innerHTML = ''; // Clear existing content

    for (let i = 1; i <= maxLevel; i++) {
        if (i > 1) {
            const connector = document.createElement('div');
            connector.className = 'level-connector';
            levelPath.appendChild(connector);
        }

        const levelNode = document.createElement('div');
        levelNode.className = `level-node ${i <= highestUnlockedLevel ? 'unlocked' : 'locked'}`;
        levelNode.textContent = i;
        levelNode.addEventListener('click', () => selectLevel(i));
        levelPath.appendChild(levelNode);
    }
}

function selectLevel(level) {
    if (level <= highestUnlockedLevel) {
        currentLevel = level;
        document.getElementById('level-selection-screen').style.display = 'none';
        startBossBattle();
    } else {
        alert('This level is locked. Complete the previous levels to unlock it.');
    }
}

function startBossBattle() {
    gameScreen.style.display = 'block';
    resetGameState();
    updateDisplay();
    startPowerupGeneration();
}

function showMainMenu() {
    mainMenu.style.display = 'block';
    gameScreen.style.display = 'none';
    upgradeScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
    document.getElementById('level-selection-screen').style.display = 'none';
    document.getElementById('boosters-shop').style.display = 'none';
    showRewardsSection(); // Show rewards section when returning to main menu
}

function resetGameState() {
    maxBossHealth = 100 + (currentLevel - 1) * 50;
    bossHealth = maxBossHealth;
    playerStamina = maxPlayerStamina;
    clearTimeout(redZoneTimeout);
    clearInterval(greenZoneInterval);
}

function updateDisplay() {
    bossHealthDisplay.textContent = `${bossHealth}/${maxBossHealth} HP`;
    staminaDisplay.textContent = `Stamina: ${playerStamina}/${maxPlayerStamina}`;
    tokenCounter.textContent = `Tokens: ${tokens}`;
    levelDisplay.textContent = `Level: ${currentLevel}`;
    document.getElementById('tap-damage-level').textContent = tapDamageLevel;
    document.getElementById('stamina-level').textContent = staminaLevel;
    document.getElementById('double-damage-level').textContent = doubleDamageDurationLevel;
    document.getElementById('streak-days').textContent = `x${streakDays}`;
    updateBoosterTokens();
    tokenCounter.textContent = `Tokens: ${Math.floor(tokens)}`;
}

// Add these event listeners
document.getElementById('boosters').addEventListener('click', showBoostersShop);
document.getElementById('back-to-menu-boosters').addEventListener('click', backToMainMenu);

// Modify your showMainMenu function to hide the boosters shop
function showMainMenu() {
    mainMenu.style.display = 'block';
    gameScreen.style.display = 'none';
    upgradeScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
    document.getElementById('level-selection-screen').style.display = 'none';
    document.getElementById('boosters-shop').style.display = 'none';
}

// Call updateBoosterTokens periodically
setInterval(updateBoosterTokens, 60000);

function showDailyRewards() {
    const daysRewards = [50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 
                         5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 
                         10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000];
    
    const today = new Date().toDateString();
    if (lastDailyRewardClaim !== today) {
      const reward = daysRewards[Math.min(streakDays - 1, daysRewards.length - 1)];
      tokens += reward;
      alert(`You've claimed your daily reward of ${reward} tokens!`);
      lastDailyRewardClaim = today;
      streakDays++;
      updateDisplay();
    } else {
      alert("You've already claimed your daily reward today. Come back tomorrow!");
    }
  }

  document.querySelectorAll('.reward-card').forEach(card => {
    card.addEventListener('click', () => {
      alert("This feature is not implemented yet. Coming soon!");
    });
  });
  
  document.getElementById('daily-rewards-btn').addEventListener('click', showDailyRewards);
  
  document.querySelectorAll('.streak-task').forEach(task => {
    task.addEventListener('click', () => {
      alert("This feature is not implemented yet. Coming soon!");
    });
  });
  
  // Add this function to handle collapsible menus
  function toggleMenu(header) {
    const content = header.nextElementSibling;
    content.classList.toggle('active');
  }
  
  // Add event listeners for menu headers
  document.querySelectorAll('.menu-header').forEach(header => {
    header.addEventListener('click', () => toggleMenu(header));
  });

  document.getElementById('streak-days').textContent = `x${streakDays}`;


  function attackBoss(e) {
    if (e.type === 'click') {
        lastClickPosition.x = e.clientX;
        lastClickPosition.y = e.clientY;
        if (playerStamina > 0) {
            let damage = doubleDamageActive ? tapDamage * 2 : tapDamage;
            bossHealth -= damage;
            playerStamina--;
            tokens += damage;
            
            if (bossHealth <= 0) {
                bossHealth = 0;
                showVictoryScreen();
            }
            
            updateDisplay();
        }
    }
}

bossImage.addEventListener('click', attackBoss);


function showVictoryScreen() {
    const existingMessage = document.getElementById('victory-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const victoryMessage = document.createElement('div');
    victoryMessage.id = 'victory-message';
    victoryMessage.innerHTML = `
        <h2>Level ${currentLevel} Complete!</h2>
        <button id="next-level">Next Level</button>
    `;
    document.getElementById('boss-container').insertAdjacentElement('afterend', victoryMessage);
    document.getElementById('next-level').addEventListener('click', nextLevel);
}


// Add this function to show the boosters shop
function showBoostersShop() {
    mainMenu.style.display = 'none';
    document.getElementById('boosters-shop').style.display = 'block';
    hideRewardsSection(); // Hide rewards section when showing boosters shop
    updateBoostersDisplay();
}

function updateBoostersDisplay() {
    const boostersList = document.getElementById('boosters-list');
    boostersList.innerHTML = '';

    const boosters = [
        {
            name: 'Cartel System',
            description: 'Start your own cartel and hire gangsters. Earns tokens per hour.',
            level: cartelLevel,
            tokensPerHour: 100 * (cartelLevel + 1),
            upgradeCost: 1000 * (cartelLevel + 1),
            image: 'images/cartel-system.png',
            upgrade: () => {
                if (tokens >= 1000 * (cartelLevel + 1)) {
                    tokens -= 1000 * (cartelLevel + 1);
                    cartelLevel++;
                    updateBoostersDisplay();
                    updateDisplay();
                } else {
                    alert('Not enough tokens to upgrade!');
                }
            }
        },
        {
            name: 'Weapons Shop',
            description: 'Start your weapons shop. Upgrade to unlock more powerful weapons.',
            level: weaponsShopLevel,
            tokensPerHour: 250 * (weaponsShopLevel + 1),
            upgradeCost: 2500 * (weaponsShopLevel + 1),
            image: 'images/weapon-shop.png',
            upgrade: () => {
                if (tokens >= 2500 * (weaponsShopLevel + 1)) {
                    tokens -= 2500 * (weaponsShopLevel + 1);
                    weaponsShopLevel++;
                    updateBoostersDisplay();
                    updateDisplay();
                } else {
                    alert('Not enough tokens to upgrade!');
                }
            }
        }
    ];

    boosters.forEach(booster => {
        const boosterCard = document.createElement('div');
        boosterCard.className = 'booster-card';
        boosterCard.innerHTML = `
            <div class="booster-info">
                <h3>${booster.name}</h3>
                <p>${booster.description}</p>
                <p>Level: ${booster.level}</p>
                <p>Earning: ${booster.tokensPerHour} tokens/hr</p>
                <button>Upgrade (${booster.upgradeCost} tokens)</button>
            </div>
            <img src="${booster.image}" alt="${booster.name}" class="booster-image">
        `;
        boosterCard.querySelector('button').addEventListener('click', booster.upgrade);
        boostersList.appendChild(boosterCard);
    });
}

// Add this function to update tokens from boosters
function updateBoosterTokens() {
    const now = Date.now();
    const elapsedHours = (now - lastBoosterUpdate) / (1000 * 60 * 60);
    const cartelTokens = Math.floor(100 * (cartelLevel + 1) * elapsedHours);
    const weaponsShopTokens = Math.floor(250 * (weaponsShopLevel + 1) * elapsedHours);
    tokens += cartelTokens + weaponsShopTokens;
    lastBoosterUpdate = now;
}

function nextLevel() {
    if (currentLevel < maxLevel) {
        currentLevel++;
        if (currentLevel > highestUnlockedLevel) {
            highestUnlockedLevel = currentLevel;
        }
        document.getElementById('victory-message').remove();
        resetGameState();
        updateDisplay();
        startPowerupGeneration();
    } else {
        alert('Congratulations! You have completed all levels!');
        currentLevel = 1;
        document.getElementById('victory-message').remove();
        showMainMenu();
    }
}

function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // Add this function to set up the referral code
  function setupReferralCode() {
    if (!referralCode) {
      referralCode = generateReferralCode();
    }
    document.getElementById('referral-code').value = referralCode;
  }
  
  // Add this function to copy the referral code
  function copyReferralCode() {
    const codeInput = document.getElementById('referral-code');
    codeInput.select();
    document.execCommand('copy');
    alert('Referral code copied to clipboard!');
  }
  
  // Add these event listeners
  document.addEventListener('DOMContentLoaded', () => {
    setupReferralCode();
    document.getElementById('copy-referral').addEventListener('click', copyReferralCode);
    showRewardsSection(); // Ensure rewards section is visible on initial load
});

function updateUpgradeInfo() {
    document.getElementById('tap-damage-info').textContent = `Current: ${tapDamage} | Next: ${tapDamage + 1}`;
    document.getElementById('stamina-info').textContent = `Current: ${maxPlayerStamina} | Next: ${maxPlayerStamina + 5}`;
    document.getElementById('double-damage-info').textContent = `Current: ${doubleDamageDuration / 1000}s | Next: ${(doubleDamageDuration + 500) / 1000}s`;
}

function upgradestat(stat, change) {
    switch (stat) {
        case 'damage':
            if (tapDamageLevel + change >= 0 && tapDamageLevel + change <= 10) {
                tapDamageLevel += change;
                tapDamage = tapDamageLevel + 1;  // This ensures tapDamage is always tapDamageLevel + 1
            }
            break;
        case 'stamina':
            if (staminaLevel + change >= 0 && staminaLevel + change <= 10) {
                staminaLevel += change;
                maxPlayerStamina += change * 5;
            }
            break;
        case 'doubleDamage':
            if (doubleDamageDurationLevel + change >= 0 && doubleDamageDurationLevel + change <= 10) {
                doubleDamageDurationLevel += change;
                doubleDamageDuration += change * 500;
            }
            break;
    }
    updateDisplay();
    updateUpgradeInfo();
}

// Modify the showUpgrades function
function showUpgrades() {
    mainMenu.style.display = 'none';
    upgradeScreen.style.display = 'block';
    hideRewardsSection(); // Hide rewards section when showing upgrades
    updateDisplay();
    updateUpgradeInfo();
}

// Stamina regeneration
setInterval(() => {
    if (playerStamina < maxPlayerStamina) {
        playerStamina++;
        updateDisplay();
    }
}, 2000);


function createPowerup(type) {
    const powerup = document.createElement('div');
    powerup.className = `powerup ${type}`;
    powerup.style.position = 'absolute';
    powerup.style.left = `${Math.random() * 80 + 10}%`;
    powerup.style.top = `${Math.random() * 80 + 10}%`;
    powerup.style.width = '30px';
    powerup.style.height = '30px';
    powerup.style.borderRadius = '50%';
    powerup.style.cursor = 'pointer';
    
    if (type === 'double-damage') {
        powerup.style.backgroundColor = 'green';
    } else {
        powerup.style.backgroundColor = 'red';
    }
    
    powerup.addEventListener('click', () => activatePowerup(type));
    bossImage.parentElement.appendChild(powerup);
    
    setTimeout(() => powerup.remove(), 3000);
}

function startPowerupGeneration() {
    scheduleRedZone();
    greenZoneInterval = setInterval(createGreenZone, 5000);
}

function scheduleRedZone() {
    const delay = Math.random() * 3000 + 1000; // Random delay between 2-5 seconds
    redZoneTimeout = setTimeout(createRedZone, delay);
}

function createRedZone() {
    const redZone = document.createElement('div');
    redZone.className = 'powerup avoidance';
    redZone.style.position = 'absolute';
    redZone.style.left = `${lastClickPosition.x - bossImage.getBoundingClientRect().left}px`;
    redZone.style.top = `${lastClickPosition.y - bossImage.getBoundingClientRect().top}px`;
    redZone.style.width = '30px';
    redZone.style.height = '30px';
    redZone.style.borderRadius = '50%';
    redZone.style.cursor = 'pointer';
    redZone.style.backgroundColor = 'red';
    
    redZone.addEventListener('click', () => activatePowerup('avoidance'));
    bossImage.parentElement.appendChild(redZone);
    
    setTimeout(() => {
        redZone.remove();
        scheduleRedZone();
    }, 1500);
}

function createGreenZone() {
    const greenZone = document.createElement('div');
    greenZone.className = 'powerup double-damage';
    greenZone.style.position = 'absolute';
    greenZone.style.left = `${Math.random() * 80 + 10}%`;
    greenZone.style.top = `${Math.random() * 80 + 10}%`;
    greenZone.style.width = '30px';
    greenZone.style.height = '30px';
    greenZone.style.borderRadius = '50%';
    greenZone.style.cursor = 'pointer';
    greenZone.style.backgroundColor = 'green';
    
    greenZone.addEventListener('click', () => activatePowerup('double-damage'));
    bossImage.parentElement.appendChild(greenZone);
    
    setTimeout(() => greenZone.remove(), 1000);
}

function activatePowerup(type) {
    if (type === 'double-damage') {
        doubleDamageActive = true;
        setTimeout(() => {
            doubleDamageActive = false;
        }, doubleDamageDuration);
    } else {
        let healPercentage = 0.05 + (currentLevel - 1) * 0.1;
        let healAmount = maxBossHealth * healPercentage;
        bossHealth = Math.min(maxBossHealth, bossHealth + healAmount);
        updateDisplay();
    }
}

// Initial display update
updateDisplay();

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
let activeTouches = new Set();
let lastTapTime = 0;
const tapCooldown = 100;


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

// Event listeners
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('upgrades').addEventListener('click', showUpgrades);
document.getElementById('back-to-menu').addEventListener('click', showMainMenu);
document.getElementById('back-to-menu-upgrade').addEventListener('click', showMainMenu);
document.getElementById('next-level').addEventListener('click', nextLevel);

document.querySelectorAll('.increase-level').forEach(button => {
    button.addEventListener('click', () => upgradestat(button.dataset.upgrade, 1));
});

document.querySelectorAll('.decrease-level').forEach(button => {
    button.addEventListener('click', () => upgradestat(button.dataset.upgrade, -1));
});

bossImage.addEventListener('touchstart', handleTouchStart, false);
bossImage.addEventListener('touchend', handleTouchEnd, false);
bossImage.addEventListener('touchcancel', handleTouchEnd, false);


bossImage.addEventListener('click', (e) => {
    lastClickPosition.x = e.clientX;
    lastClickPosition.y = e.clientY;
    attackBoss();
});

function startGame() {
    mainMenu.style.display = 'none';
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
}



function attackBoss() {
    const now = Date.now();
    if (now - lastTapTime < tapCooldown) return;
    lastTapTime = now;

    if (playerStamina > 0) {
        let damage = (doubleDamageActive ? tapDamage * 2 : tapDamage) * activeTouches.size;
        bossHealth -= damage;
        playerStamina -= activeTouches.size;
        tokens += damage;
        
        if (bossHealth <= 0) {
            bossHealth = 0;
            showVictoryScreen();
        }
        
        updateDisplay();
    }
}

function showVictoryScreen() {
    const victoryMessage = document.createElement('div');
    victoryMessage.id = 'victory-message';
    victoryMessage.innerHTML = `
        <h2>Level ${currentLevel} Complete!</h2>
        <button id="next-level">Next Level</button>
    `;
    document.getElementById('boss-container').insertAdjacentElement('afterend', victoryMessage);
    document.getElementById('next-level').addEventListener('click', nextLevel);
}

function nextLevel() {
    if (currentLevel < maxLevel) {
        currentLevel++;
        document.getElementById('victory-message').remove();
        startGame();
    } else {
        alert('Congratulations! You have completed all levels!');
        currentLevel = 1;
        document.getElementById('victory-message').remove();
        showMainMenu();
    }
}

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

function handleTouchStart(e) {
    e.preventDefault(); // Prevent default touch behavior
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        activeTouches.add(touch.identifier);
        attackBoss();
        
        // Update last click position (use the first touch for simplicity)
        if (i === 0) {
            lastClickPosition.x = touch.clientX;
            lastClickPosition.y = touch.clientY;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault(); // Prevent default touch behavior
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        activeTouches.delete(touches[i].identifier);
    }
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

const laser = document.getElementById('laser');
let laserInterval;
let alienInterval;
let lasers = [];
let asteroids = [];
let meteoroids = [];

// Initialize ship position with its initial position on the screen
let ship = document.getElementById('ship');
let shipPositionX = ship.offsetLeft;
let shipPositionY = ship.offsetTop;

// Initialize alien position with its initial position on the screen
let alien = document.getElementById('alien');
let alienPositionX = alien.offsetLeft;
let alienPositionY = alien.offsetTop;

// Initialize yellow line position at the bottom of the screen
let yellowLine = document.createElement('div');
yellowLine.className = 'yellow-line';
yellowLine.style.position = 'absolute';
yellowLine.style.width = '100%';
yellowLine.style.height = '5px';
yellowLine.style.backgroundColor = 'yellow';
yellowLine.style.bottom = '0';
document.getElementById('game-container').appendChild(yellowLine);

// Rest of the JavaScript code remains unchanged
// Make sure to include the remaining code here

const shipSpeed = 12;
const alienSpeed = 2; // Adjust the alien speed as needed

let lives = 5; // Player lives
let isMoving = false;
let isShooting = false;
let aliensCrossedLine = 0; // Count of aliens that crossed the yellow line

// Function to update the heart icons indicating player lives
function updateLives() {
    let livesContainer = document.getElementById('lives-container');
    let heartIcons = '';

    for (let i = 0; i < lives; i++) {
        heartIcons += ' ♥ '; // Add heart symbol to the string
    }

    livesContainer.textContent = heartIcons; // Set the text content to display heart icons
}

// Initialize lives display
updateLives();

document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    switch (key) {
        case 'arrowup':
            isMoving = true;
            moveShip('up');
            break;
        case 'arrowdown':
            isMoving = true;
            moveShip('down');
            break;
        case 'arrowleft':
            isMoving = true;
            moveShip('left');
            break;
        case 'arrowright':
            isMoving = true;
            moveShip('right');
            break;
        case ' ':
            if (!isShooting) {
                isShooting = true;
                shootLaser();
            }
            break;
        default:
            break;
    }
});

let laserIntervals = [];
let alienIntervals = [];

function shootLaser() {
    // Reduce score by 20 for every laser fired
    score -= 20;
    updateScoreAndAliensDestroyed();

    let newLaser = document.createElement('div');
    newLaser.className = 'laser';
    document.getElementById('game-container').appendChild(newLaser);

    let shipRect = ship.getBoundingClientRect();
    let laserPositionX = shipRect.left + ship.offsetWidth / 2;
    let laserPositionY = shipRect.top - 20;

    newLaser.style.left = laserPositionX + 'px';
    newLaser.style.top = laserPositionY + 'px';

    let intervalId = setInterval(function() {
        laserPositionY -= 5;
        newLaser.style.top = laserPositionY + 'px';

        let aliens = document.querySelectorAll('.alien');
        let asteroids = document.querySelectorAll('.asteroid');
        let meteoroids = document.querySelectorAll('.meteoroid');

        aliens.forEach(alien => {
            let alienRect = alien.getBoundingClientRect();
            if (
                laserPositionX > alienRect.left &&
                laserPositionX < alienRect.right &&
                laserPositionY > alienRect.top &&
                laserPositionY < alienRect.bottom
            ) {
                clearInterval(intervalId);
                newLaser.remove();
                alien.remove();
                clearInterval(alienInterval);
                destroyAlien(); // Call the destroyAlien function to update score and count of aliens destroyed
                isShooting = false; // Reset the shooting flag
            }
        });
        

        asteroids.forEach(asteroid => {
            let asteroidRect = asteroid.getBoundingClientRect();
            if (
                laserPositionX > asteroidRect.left &&
                laserPositionX < asteroidRect.right &&
                laserPositionY > asteroidRect.top &&
                laserPositionY < asteroidRect.bottom
            ) {
                clearInterval(intervalId);
                newLaser.remove();
                asteroid.remove();
                score += 50; // Increase score by 50 for destroying an asteroid
                updateScoreAndAliensDestroyed();
                isShooting = false; // Reset the shooting flag
            }
        });

        meteoroids.forEach(meteoroid => {
            let meteoroidRect = meteoroid.getBoundingClientRect();
            if (
                laserPositionX > meteoroidRect.left &&
                laserPositionX < meteoroidRect.right &&
                laserPositionY > meteoroidRect.top &&
                laserPositionY < meteoroidRect.bottom
            ) {
                clearInterval(intervalId);
                newLaser.remove();
                meteoroid.remove();
                score += 25; // Increase score by 25 for destroying a meteoroid
                updateScoreAndAliensDestroyed();
                isShooting = false; // Reset the shooting flag
            }
        });

        if (laserPositionY < 0) {
            clearInterval(intervalId);
            newLaser.remove();
            isShooting = false; // Reset the shooting flag
        }
    }, 1);

    laserIntervals.push(intervalId);
}

function moveShip(direction) {
    switch (direction) {
        case 'up':
            shipPositionY = Math.max(0, shipPositionY - shipSpeed);
            break;
        case 'down':
            shipPositionY = Math.min(window.innerHeight - ship.offsetHeight, shipPositionY + shipSpeed);
            break;
        case 'left':
            // If the ship reaches the left edge, teleport it to the right edge
            if (shipPositionX <= 0) {
                shipPositionX = window.innerWidth - ship.offsetWidth;
            } else {
                shipPositionX = Math.max(0, shipPositionX - shipSpeed);
            }
            break;
        case 'right':
            // If the ship reaches the right edge, teleport it to the left edge
            if (shipPositionX + ship.offsetWidth >= window.innerWidth) {
                shipPositionX = 0;
            } else {
                shipPositionX = Math.min(window.innerWidth - ship.offsetWidth, shipPositionX + shipSpeed);
            }
            break;
        default:
            break;
    }
    updateShipPosition();
}


function updateShipPosition() {
    ship.style.left = shipPositionX + 'px';
    ship.style.top = shipPositionY + 'px';
}

function createAlien() {
    let newAlien = document.createElement('div');
    newAlien.className = 'alien';
    document.getElementById('game-container').appendChild(newAlien);

    let minPositionX = 100; // Minimum X position
    let maxPositionX = window.innerWidth - 100; // Maximum X position
    let alienPositionX = Math.floor(Math.random() * (maxPositionX - minPositionX)) + minPositionX;

    let alienPositionY = -75;

    newAlien.style.left = alienPositionX + 'px';
    newAlien.style.top = alienPositionY + 'px';

    return newAlien;
}


function moveAlien(newAlien) {
    let hasCrossedLine = false; // Flag to track if the alien has crossed the yellow line in this crossing event
    let intervalId = setInterval(function() {
        let alienPositionY = parseInt(newAlien.style.top) || 0;
        alienPositionY += alienSpeed;
        newAlien.style.top = alienPositionY + 'px';

        if (!document.contains(newAlien)) {
            clearInterval(intervalId);
            alienIntervals.splice(alienIntervals.indexOf(intervalId), 1);
            return;
        }

        if (alienPositionY >= window.innerHeight - newAlien.offsetHeight) {
            clearInterval(intervalId);
            newAlien.remove();
            alienIntervals.splice(alienIntervals.indexOf(intervalId), 1);
        }

        // Check if the bottom edge of the alien crosses the top edge of the yellow line
        if (alienPositionY + newAlien.offsetHeight >= window.innerHeight - yellowLine.offsetHeight && !hasCrossedLine) {
            // Increment the count of aliens that crossed the yellow line
            aliensCrossedLine++;
            hasCrossedLine = true; // Set the flag to true to indicate that the alien has crossed the line in this event
            alienIntervals.push(intervalId);
            // Decrease lives if an alien crosses the yellow line
            lives--;
            updateLives();
        }
    }, 10);

}

function createAndMoveAlien() {
    if (alienIntervals.length < 3) {
        let newAlien = createAlien();
        if (newAlien) {
            moveAlien(newAlien);
        }
    }

    // Check if lives are zero and display "Game Over" popup
    if (lives <= 0) {
        alert('Game Over!');
    }
}


setInterval(createAndMoveAlien, 2000);

let score = 100; // Initialize score
let aliensDestroyed = 0; // Initialize count of aliens destroyed

function updateScoreAndAliensDestroyed() {
    // Update score display
    document.getElementById('score').textContent = 'Score: ' + score;

    // Update aliens destroyed display
    document.getElementById('aliens-destroyed').textContent = 'Aliens Destroyed: ' + aliensDestroyed;
}

// Increment score every second
setInterval(function() {
    // Only update score if lives are greater than 0
    if (lives > 0) {
        score++;
        updateScoreAndAliensDestroyed();
    }
}, 1000);

// Update score when an alien is destroyed
function destroyAlien() {
    aliensDestroyed++;
    score += 80; // Increase score by 80 for every alien destroyed
    updateScoreAndAliensDestroyed();
}


function createAsteroid() {
    let newAsteroid = document.createElement('div');
    newAsteroid.id = 'asteroid';
    newAsteroid.className = 'asteroid';
    document.getElementById('game-container').appendChild(newAsteroid);

    let minPositionX = 100; // Minimum X position
    let maxPositionX = window.innerWidth - 100; // Maximum X position
    let asteroidPositionX = Math.floor(Math.random() * (maxPositionX - minPositionX)) + minPositionX;

    let asteroidPositionY = -75;

    newAsteroid.style.left = asteroidPositionX + 'px';
    newAsteroid.style.top = asteroidPositionY + 'px';

    return newAsteroid;
}


function createMeteoroid() {
    let newMeteoroid = document.createElement('div');
    newMeteoroid.id = 'meteoroid';
    newMeteoroid.className = 'meteoroid';
    document.getElementById('game-container').appendChild(newMeteoroid);

    let minPositionX = 100; // Minimum X position
    let maxPositionX = window.innerWidth - 100; // Maximum X position
    let meteoroidPositionX = Math.floor(Math.random() * (maxPositionX - minPositionX)) + minPositionX;

    let meteoroidPositionY = -75;

    newMeteoroid.style.left = meteoroidPositionX + 'px';
    newMeteoroid.style.top = meteoroidPositionY + 'px';

    return newMeteoroid;
}

function createAndMoveAsteroidMeteoroid() {
    // Randomly decide whether to create an asteroid or a meteoroid
    if (Math.random() < 0.05) { // Adjust the probability as needed
        let newAsteroid = createAsteroid();
        if (newAsteroid) {
            moveAsteroidMeteoroid(newAsteroid);
        }
    } else if (Math.random() < 0.05) { // Adjust the probability as needed
        let newMeteoroid = createMeteoroid();
        if (newMeteoroid) {
            moveAsteroidMeteoroid(newMeteoroid);
        }
    }
}

function moveAsteroidMeteoroid(element) {
    let intervalId = setInterval(function() {
        let elementPositionY = parseInt(element.style.top) || 0;
        elementPositionY += 2; // Adjust the speed as needed
        element.style.top = elementPositionY + 'px';

        if (!document.contains(element)) {
            clearInterval(intervalId);
            return;
        }

        if (elementPositionY >= window.innerHeight - element.offsetHeight) {
            clearInterval(intervalId);
            element.remove();
        }
    }, 10);
}

setInterval(createAndMoveAsteroidMeteoroid, 3000); // Adjust the interval as needed
const laser = document.getElementById('laser');
let laserInterval;
let alienInterval;
let lasers = [];

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

document.addEventListener('keyup', function(event) {
    const key = event.key.toLowerCase();
    switch (key) {
        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright':
            isMoving = false;
            break;
        case ' ':
            isShooting = false;
            break;
        default:
            break;
    }
});

let laserIntervals = [];
let alienIntervals = [];

function shootLaser() {
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
                //alert('Alien Destroyed!');
            }
        });

        if (laserPositionY < 0) {
            clearInterval(intervalId);
            newLaser.remove();
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
            shipPositionX = Math.max(0, shipPositionX - shipSpeed);
            break;
        case 'right':
            shipPositionX = Math.min(window.innerWidth - ship.offsetWidth, shipPositionX + shipSpeed);
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

    let alienPositionX = Math.floor(Math.random() * (window.innerWidth - 50));
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
            console.log(aliensCrossedLine);
            if (aliensCrossedLine >= 5) {
                // Game over when 5 or more aliens cross the yellow line
                alert('Game Over!');
            }
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
}

setInterval(createAndMoveAlien, 2000);

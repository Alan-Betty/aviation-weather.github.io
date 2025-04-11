const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const raindrops = [];

function createRaindrop() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * -canvas.height;
    const speed = Math.random() * 20 + 15;
    const length = Math.random() * 35 + 28;
    const opacity = Math.random() * 0.6 + 0.2; // Random opacity for natural effect
    const drift = Math.random() * 2 - 1; // Horizontal drift to simulate wind
    const isBackRow = Math.random() > 0.5; // Randomly assign some drops to the back row
    raindrops.push({ x, y, speed, length, opacity, drift, isBackRow, splatTriggered: false });
}

function createSplat(x, isBackRow) {
    const splat = document.createElement('div');
    splat.className = 'splat';
    splat.style.position = 'absolute';
    splat.style.left = `${x}px`;
    splat.style.top = `${window.innerHeight - (isBackRow ? 70 : 50) + window.scrollY}px`; // Higher for back row
    splat.style.transform = 'translate(-50%, -50%)'; // Center the splat
    splat.style.zIndex = '0';
    splat.style.opacity = '0.3';
    document.body.appendChild(splat);

    setTimeout(() => {
        splat.remove();
    }, 500); // Match the animation duration
}

function updateRaindrops() {
    for (let i = raindrops.length - 1; i >= 0; i--) {
        const drop = raindrops[i];
        drop.y += drop.speed;
        drop.x += drop.drift; // Add horizontal drift for natural effect

        // Trigger splat effect slightly earlier without removing the raindrop
        if (!drop.splatTriggered && drop.y > canvas.height - 120) { // Adjusted for earlier splat
            createSplat(drop.x, drop.isBackRow);
            drop.splatTriggered = true; // Ensure splat is triggered only once
        }

        // Remove raindrop slightly earlier than the bottom
        if (drop.y > canvas.height - 50) {
            raindrops.splice(i, 1);
        }
    }
}

function drawRaindrops() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for each frame
    ctx.beginPath();
    for (const drop of raindrops) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity})`; // Use random opacity
        ctx.lineWidth = 0.5; // Thin raindrops for natural look
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y - drop.length);
    }
    ctx.stroke();
}

function animate() {
    if (raindrops.length < 100) {
        createRaindrop();
    }

    updateRaindrops();
    drawRaindrops();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();

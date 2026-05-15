// --- Optimized TypeScript ---
const navbar = document.getElementById('navbar') as HTMLElement;
// Create a 10px invisible sensor at the top of the viewport
const triggerZone = document.createElement('div');
triggerZone.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:10px;z-index:998;';
document.body.appendChild(triggerZone);

let lastScrollY = window.scrollY;
let isScrollingDown = false;

// 1. SCROLL LOGIC (Throttled via requestAnimationFrame for performance)
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    // Scrolling Down
    navbar.style.transform = 'translateY(-100%)';
    isScrollingDown = true;
  } else {
    // Scrolling Up
    navbar.style.transform = 'translateY(0)';
    isScrollingDown = false;
  }
  lastScrollY = currentScrollY;
});

// 2. TRIGGER LOGIC (Hovering the invisible zone reveals the nav)
triggerZone.addEventListener('mouseenter', () => {
  navbar.style.transform = 'translateY(0)';
});

// 3. NAVBAR PERSISTENCE (Keep it down while mouse is over it)
navbar.addEventListener('mouseleave', () => {
  // Only hide it again if we are still in a "scrolling down" state
  if (isScrollingDown && window.scrollY > 100) {
    navbar.style.transform = 'translateY(-100%)';
  }
});

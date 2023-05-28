function calculateVh() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
}
// Initial calculation
calculateVh();
// Re-calculate on resize
window.addEventListener('resize', calculateVh);
// Re-calculate on device orientation change
window.addEventListener('orientationchange', calculateVh);

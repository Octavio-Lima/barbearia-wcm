const GRID_CONTAINER = document.querySelector('.grid-container');
const SIDEBAR = document.getElementById('sidebar');
const MAIN_CONTENT = document.getElementById('main');
const TOGGLER = document.getElementById('sidebar-toggle');
let sidebarState = false;
function ToggleSidebar() {
    sidebarState = !sidebarState;
    if (sidebarState == true) {
        if (GRID_CONTAINER)
            GRID_CONTAINER.style.gridTemplateColumns = "300px auto";
    }
    else {
        if (GRID_CONTAINER)
            GRID_CONTAINER.style.gridTemplateColumns = "56px auto";
    }
}
TOGGLER?.addEventListener('click', () => { ToggleSidebar(); });

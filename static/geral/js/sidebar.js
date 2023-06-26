const MAIN_CONTENT = document.querySelector('.grid-container');
const SIDEBAR = document.getElementById('sidebar');
const TOGGLER = document.getElementById('sidebar-toggle');
const TOGGLER_INSIDE = document.getElementById('sidebar-toggle-inside');
const LINK_TEXT_LIST = document.querySelectorAll('.sidebar-link-name');
const LINK_LIST = document.querySelectorAll('.sidebar-shortcut');
let sidebarState = false;
function ToggleSidebar() {
    sidebarState = !sidebarState;
    if (sidebarState == true) {
        if (SIDEBAR)
            SIDEBAR.style.width = "300px";
        if (MAIN_CONTENT)
            MAIN_CONTENT.style.marginLeft = "300px";
        LINK_TEXT_LIST?.forEach((text) => {
            text.style.opacity = '1';
            text.style.width = 'auto';
        });
    }
    else {
        if (SIDEBAR)
            SIDEBAR.style.width = "56px";
        if (MAIN_CONTENT)
            MAIN_CONTENT.style.marginLeft = "56px";
        LINK_TEXT_LIST?.forEach((text) => {
            text.style.opacity = '0';
            text.style.width = 'auto';
        });
    }
}
TOGGLER?.addEventListener('click', () => { ToggleSidebar(); });
TOGGLER_INSIDE?.addEventListener('click', () => { ToggleSidebar(); });

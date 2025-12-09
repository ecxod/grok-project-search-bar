// ==UserScript==
// @name         Grok.com Projects – Live-Suche
// @namespace    https://grok.com
// @version      1.0
// @description  Fügt eine Suchleiste auf /project ein – filtert live nach Projektnamen
// @author       Du + Grok
// @match        https://grok.com/project*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Warte kurz, falls React noch nachlädt
    const waitForProjects = setInterval(() => {
        const grid = document.querySelector('div.grid.grid-cols-1.md\\:grid-cols-2');
        if (grid && grid.children.length > 0) {
            clearInterval(waitForProjects);
            initSearch();
        }
    }, 300);

    function initSearch() {
        // Prüfen, ob wir schon mal waren (verhindert doppelte Suche)
        if (document.getElementById('grok-project-search-container')) return;

        // 1. Container finden, WO die Suchleiste hin soll (direkt unter den Tabs)
        const tabList = document.querySelector('div[role="tablist"]');
        if (!tabList) return;

        // 2. Suchleiste bauen – sieht aus wie der Rest der UI
        const searchContainer = document.createElement('div');
        searchContainer.id = 'grok-project-search-container';
        searchContainer.innerHTML = `
            <div class="px-4 py-3 bg-surface-base border-b border-border-l1">
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input 
                        type="text" 
                        id="grok-project-search" 
                        placeholder="Projekt Name durchsuchen… " 
                        autocomplete="off"
                        class="flex-1 bg-transparent outline-none text-primary placeholder-secondary text-base"
                    >
                    <span id="grok-search-counter" class="text-sm text-secondary"></span>
                </div>
            </div>
        `;

        // Direkt nach den Tabs einfügen
        tabList.parentNode.insertBefore(searchContainer, tabList.nextSibling);

        // 3. Referenzen
        const input = document.getElementById('grok-project-search');
        const counter = document.getElementById('grok-search-counter');
        const grid = document.querySelector('div.grid.grid-cols-1.md\\:grid-cols-2');
        const projectCards = grid.querySelectorAll('div.group.relative');

        let total = projectCards.length;

        // 4. Filter-Funktion
        function filterProjects() {
            const query = input.value.toLowerCase().trim();
            let visible = 0;

            projectCards.forEach(card => {
                const titleEl = card.querySelector('div.text-base.font-semibold.truncate');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';

                if (query === '' || title.includes(query)) {
                    card.style.display = '';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });

            counter.textContent = query === '' ? '' : `${visible} von ${total}`;
        }

        // 5. Event Listener
        input.addEventListener('input', filterProjects);

        // Optional: ESC löscht die Suche
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                input.value = '';
                filterProjects();
            }
        });

        // Fokus beim Klick auf das Lupen-Icon
        searchContainer.addEventListener('click', e => {
            if (e.target.tagName === 'svg' || e.target.closest('svg')) input.focus();
        });
    }
})();

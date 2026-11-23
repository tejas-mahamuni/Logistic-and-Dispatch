/**
 * hubs.js — Shared hub selector helper
 * Populates any <select> element with the list of active hubs from the API.
 *
 * Usage:
 *   import { fillHubSelect } from './hubs.js';
 *   await fillHubSelect(document.getElementById('hubId'));
 *   await fillHubSelect(el, { allOption: true }); // prepend "All Hubs" option
 */
import { HubApi } from './api.js';

/**
 * @param {HTMLSelectElement} selectEl  - The <select> to populate.
 * @param {object}            opts
 * @param {boolean}           opts.allOption - If true, prepend an "All Hubs" option (value="").
 */
export async function fillHubSelect(selectEl, { allOption = false } = {}) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="" disabled selected>Loading hubs from database...</option>';
    selectEl.disabled = true;

    try {
        const raw = await HubApi.list();
        const hubs = Array.isArray(raw) ? raw : (raw?.content || raw?.data || []);

        selectEl.innerHTML = '';

        if (allOption) {
            const all = document.createElement('option');
            all.value = '';
            all.textContent = 'All Hubs';
            selectEl.appendChild(all);
        }

        if (hubs.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.disabled = true;
            opt.selected = true;
            opt.textContent = 'No active hubs found';
            selectEl.appendChild(opt);
            selectEl.disabled = false;
            return;
        }

        hubs.forEach((h, idx) => {
            const opt = document.createElement('option');
            opt.value = h.id;
            const code = h.code || h.hubCode || `HUB-${h.id}`;
            const name = h.name || h.hubName || 'Pune Regional Hub';
            const pin = h.pincode ? ` (${h.pincode})` : '';
            opt.textContent = `${code} — ${name}${pin}`;
            if (idx === 0 && !allOption) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });

        selectEl.disabled = false;
    } catch (err) {
        console.error('Failed to load hub list:', err);
        selectEl.innerHTML = '<option value="" disabled selected>Failed to load hubs</option>';
        selectEl.disabled = true;

        const errEl = selectEl.parentElement?.querySelector('[data-hub-error]');
        if (errEl) {
            errEl.textContent = 'Could not reach the server. Is Spring Boot running on port 8080?';
            errEl.style.display = 'block';
        }
    }
}

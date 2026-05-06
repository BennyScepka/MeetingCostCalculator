document.addEventListener('DOMContentLoaded', () => {
    initTooltips(document);
    populateDurationDropdown();

    addParticipant('timer', 'Consultant', 1, 'h', 85);
    addParticipant('timer', 'Kunde', 2, 'tag', 600);
    addParticipant('calc', 'Consultant', 1, 'h', 85);
    addParticipant('calc', 'Kunde', 2, 'tag', 600);
});

// ── Bootstrap tooltips ────────────────────────────────────────────────────────

function initTooltips(root) {
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el, { trigger: 'hover focus' });
    });
}

// ── Duration dropdown ─────────────────────────────────────────────────────────

function populateDurationDropdown() {
    const select = document.getElementById('calc-duration');

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— Dauer wählen —';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    for (let i = 1; i <= 32; i++) {
        const minutes = i * 15;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const opt = document.createElement('option');
        opt.value = minutes / 60;
        opt.textContent = h > 0
            ? (m === 0 ? `${h}:00 h` : `${h}:${String(m).padStart(2, '0')} h`)
            : `${m} min`;
        select.appendChild(opt);
    }
}

// ── Participants ──────────────────────────────────────────────────────────────

function addParticipant(panel, name = '', count = 1, rateType = 'h', rate = 0) {
    const container = document.getElementById(`${panel}-participants`);

    const row = document.createElement('div');
    row.className = 'participant-row';

    const isHourly = rateType === 'h';

    row.innerHTML = `
        <input type="text" class="form-control form-control-sm p-name"
               placeholder="Rolle (z.B. Consultant)" value="${name}">
        <input type="number" class="form-control form-control-sm p-count text-center"
               min="1" value="${count}"
               data-bs-toggle="tooltip" title="Anzahl Personen dieser Rolle">
        <div class="btn-group btn-group-sm rate-toggle" role="group">
            <button type="button"
                    class="btn ${isHourly ? 'btn-primary' : 'btn-outline-primary'} rate-btn"
                    data-type="h"
                    data-bs-toggle="tooltip" title="Stundensatz – direkt pro Stunde abgerechnet">€/h</button>
            <button type="button"
                    class="btn ${!isHourly ? 'btn-primary' : 'btn-outline-primary'} rate-btn"
                    data-type="tag"
                    data-bs-toggle="tooltip" title="Tagessatz – wird durch Stunden/Tag geteilt um den Stundensatz zu erhalten">€/Tag</button>
        </div>
        <input type="number" class="form-control form-control-sm p-rate text-end"
               min="0" step="any" value="${rate}"
               data-bs-toggle="tooltip" title="Kosten in Euro (Stunden- oder Tagessatz)">
        <button class="btn btn-sm btn-outline-danger btn-remove"
                data-bs-toggle="tooltip" title="Teilnehmer entfernen">×</button>
    `;

    row.querySelectorAll('.rate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            row.querySelectorAll('.rate-btn').forEach(b => {
                b.classList.replace('btn-primary', 'btn-outline-primary');
            });
            btn.classList.replace('btn-outline-primary', 'btn-primary');
        });
    });

    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());

    initTooltips(row);
    container.appendChild(row);
}

function getParticipants(panel) {
    const hoursPerDay = Math.max(1, parseFloat(document.getElementById(`${panel}-hours-per-day`).value) || 8);

    return Array.from(document.querySelectorAll(`#${panel}-participants .participant-row`)).map(row => {
        const name      = row.querySelector('.p-name').value.trim() || 'Teilnehmer';
        const count     = parseInt(row.querySelector('.p-count').value) || 0;
        const rateType  = row.querySelector('.rate-btn.btn-primary')?.dataset.type || 'h';
        const rate      = parseFloat(row.querySelector('.p-rate').value) || 0;
        const hourlyRate = rateType === 'tag' ? rate / hoursPerDay : rate;
        return { name, count, rateType, rate, hourlyRate };
    });
}

function totalHourlyCost(panel) {
    return getParticipants(panel).reduce((sum, p) => sum + p.count * p.hourlyRate, 0);
}

function fmt(val) {
    return '€ ' + val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Timer ─────────────────────────────────────────────────────────────────────

let timerInterval;
let timerStart;
let elapsedMs  = 0;
let timerRunning = false;

document.getElementById('timer-add-participant').addEventListener('click', () =>
    addParticipant('timer'));

document.getElementById('startButton').addEventListener('click', () => {
    if (timerRunning) return;
    timerRunning = true;
    timerStart   = Date.now() - elapsedMs;
    timerInterval = setInterval(tickTimer, 100);
});

document.getElementById('stopButton').addEventListener('click', () => {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
});

document.getElementById('resetButton').addEventListener('click', () => {
    timerRunning = false;
    clearInterval(timerInterval);
    elapsedMs = 0;
    document.getElementById('timer-time').textContent = '00:00:00';
    document.getElementById('timer-cost').textContent = fmt(0);
});

function tickTimer() {
    elapsedMs = Date.now() - timerStart;
    const hours = elapsedMs / 3_600_000;
    document.getElementById('timer-time').textContent = formatTime(elapsedMs);
    document.getElementById('timer-cost').textContent = fmt(hours * totalHourlyCost('timer'));
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map(v => String(v).padStart(2, '0')).join(':');
}

// ── Calculator ────────────────────────────────────────────────────────────────

document.getElementById('calc-add-participant').addEventListener('click', () =>
    addParticipant('calc'));

document.getElementById('calculateButton').addEventListener('click', () => {
    const hours = parseFloat(document.getElementById('calc-duration').value) || 0;
    const participants = getParticipants('calc');
    const total = hours * participants.reduce((sum, p) => sum + p.count * p.hourlyRate, 0);

    document.getElementById('calc-cost').textContent = fmt(total);

    const breakdown = document.getElementById('calc-breakdown');
    if (hours > 0 && participants.length > 0) {
        breakdown.innerHTML = participants.map(p => {
            const cost = hours * p.count * p.hourlyRate;
            const rateLabel = p.rateType === 'tag'
                ? `${fmt(p.rate)}/Tag`
                : `${fmt(p.rate)}/h`;
            return `<div class="breakdown-row">
                <span>${p.name} &times; ${p.count} &nbsp;<span class="text-muted">(${rateLabel})</span></span>
                <strong>${fmt(cost)}</strong>
            </div>`;
        }).join('');
    } else {
        breakdown.innerHTML = '';
    }
});

document.getElementById('resetCalcButton').addEventListener('click', () => {
    document.getElementById('calc-duration').selectedIndex = 0;
    document.getElementById('calc-cost').textContent = fmt(0);
    document.getElementById('calc-breakdown').innerHTML = '';
});

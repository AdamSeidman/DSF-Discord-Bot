const VERSION = "1.0";  // Saved memory version
const KEY = "PRO_BLOCKS_DATA";

let ghost = document.createElement('div');
ghost.className = 'ghost';
let activeDragData = { isLogic: false, isLink: false };
let lastCompiledJSON = "";

/* === INITIALIZATION & PERSISTENCE === */

function initWorkspace() {
    const saved = localStorage.getItem(KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.v === VERSION) {
                const ws = document.getElementById('workspace');
                ws.innerHTML = '';
                data.chains.forEach(c => {
                    const chainEl = buildChainUI(c.isRoot);
                    c.blocks.forEach(bData => chainEl.appendChild(reconstructBlock(bData)));
                });
            }
        } catch (e) { console.error("Corrupt save", e); }
    }
    
    if (document.querySelectorAll('.chain-container.is-root').length === 0) {
        createChain(true);
    }

    // Handle Bar State- Default to minimized if key doesn't exist or is true
    const barState = localStorage.getItem('BAR_MINIMIZED');
    if (barState !== 'false') {
        toggleBottomBar(false); 
    }

    refreshUI();
}

function saveState() {
    const chains = Array.from(document.querySelectorAll('#workspace .chain-container')).map(c => ({
        isRoot: c.classList.contains('is-root'),
        blocks: Array.from(c.querySelectorAll(':scope > .block:not(.start-block)')).map(serialize)
    }));
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, chains }));
}

function serialize(el) {
    return {
        tid: el.dataset.tplSource || el.id,
        vals: Array.from(el.querySelectorAll(':scope > input[type="text"], :scope > .input-row input, :scope > .inner-inputs input, .pro-male, .pro-female')).map(i => i.value),
        sel: el.querySelector(':scope .link-sel, :scope .tag-sel, :scope .ptag-sel')?.value,
        rads: Array.from(el.querySelectorAll(':scope .radio-group input:checked')).map(r => ({n: r.name.split('_')[0], v: r.value})),
        slots: Array.from(el.querySelectorAll(':scope > .slot')).map(s => {
            const inner = s.querySelector(':scope > .block');
            return inner ? serialize(inner) : null;
        })
    };
}

function reconstructBlock(data) {
    const tpl = document.getElementById(data.tid);
    const inst = setupNewInstance(tpl);
    inst.dataset.tplSource = data.tid;

    if (data.tid === 'tpl_multi') {
        const wrap = inst.querySelector('.inner-inputs');
        wrap.innerHTML = '';
        data.vals.forEach(() => {
            const i = document.createElement('input');
            i.type = 'text'; i.style.width = "100px"; i.oninput = invalidateCalc;
            wrap.appendChild(i);
        });
    }

    const inps = inst.querySelectorAll(':scope > input[type="text"], :scope > .input-row input, :scope > .inner-inputs input');
    inps.forEach((inp, i) => { if(data.vals[i] !== undefined) inp.value = data.vals[i]; });

    // Handle dropdowns (Links, Tags, and Plural Tags)
    const sel = inst.querySelector('.link-sel, .tag-sel, .ptag-sel');
    if (sel) {
        if (sel.classList.contains('link-sel')) {
            sel.dataset.pendingValue = data.sel; // Links handled in refreshUI
        } else {
            sel.value = data.sel; // Tags handled immediately
        }
    }

    data.rads.forEach(r => {
        const radio = inst.querySelector(`input[name^="${r.n}"][value="${r.v}"]`);
        if (radio) radio.checked = true;
    });

    const slots = inst.querySelectorAll(':scope > .slot');
    data.slots.forEach((sData, i) => {
        if (sData) slots[i].appendChild(reconstructBlock(sData));
    });

    return inst;
}

/* === UI HELPERS === */

function toggleBottomBar(animate = true) {
    const bar = document.getElementById('bottom-bar');
    const text = document.getElementById('toggle-text');
    if (!animate) bar.style.transition = 'none';

    const isCollapsed = bar.classList.toggle('collapsed');

    document.documentElement.style.setProperty('--bar-height', isCollapsed? '0px' : '160px')
    text.innerText = isCollapsed ? "Expand" : "Minimize";
    
    localStorage.setItem('BAR_MINIMIZED', isCollapsed);
    if (!animate) {
        bar.offsetHeight; 
        bar.style.transition = '';
    }
}

function invalidateCalc() {
    document.getElementById('copyBtn').disabled = true;
    saveState();
}

function allowDrop(ev) {
    ev.preventDefault();
    let target = ev.target;
    
    if (target.classList.contains('slot-label')) {
        target = target.nextElementSibling;
    }

    if (target.closest('#palette')) {
        ev.dataTransfer.dropEffect = "move";
        if (ghost.parentNode) ghost.remove();
        return; 
    }

    const palette = target.closest('#palette');
    const chain = target.closest('.chain-container');
    const slot = target.closest('.slot');

    if (palette) {
        ev.dataTransfer.dropEffect = "move";
        return; 
    }

    // Logic for slots (prevents nesting logic blocks)
    if (slot && activeDragData.isLogic) {
        ev.dataTransfer.dropEffect = "none";
        target.classList.add('no-drop');
        if (ghost.parentNode) ghost.remove(); 
        return;
    }

    // Logic for links (only allowed in root chains)
    if (activeDragData.isLink && (!chain || !chain.classList.contains('is-root'))) {
        ev.dataTransfer.dropEffect = "none";
        target.classList.add('no-drop');
        if (ghost.parentNode) ghost.remove(); 
        return;
    }

    ev.dataTransfer.dropEffect = "move";
    if (target.classList) target.classList.remove('no-drop');

    // Handle ghost placement
    if (slot) {
        if (slot.children.length === 0 || (slot.children.length === 1 && slot.children[0] === ghost)) {
            slot.appendChild(ghost);
        }
    } else if (chain) {
        const afterElement = getDragAfterElement(chain, ev.clientY);
        if (afterElement == null) chain.appendChild(ghost);
        else chain.insertBefore(ghost, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(':scope > .block:not(.start-block):not(.ghost)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - (box.height / 4);
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function drag(ev) {
    const block = ev.target.closest('.block');
    if (!block) return;
    ev.dataTransfer.setData("text", block.id);
    const tid = block.dataset.tplSource || block.id;
    activeDragData.isLogic = (tid === 'tpl_logic');
    activeDragData.isLink = (tid === 'tpl_dynamic');
    invalidateCalc();
}

function dropToWorkspace(ev) { 
    ev.preventDefault(); 
    if (ghost.parentNode) ghost.remove(); 
}

function buildChainUI(isRoot = false) {
    const container = document.createElement('div');
    container.className = 'chain-container';
    if (isRoot) container.classList.add('is-root');
    container.id = "c_" + Math.random().toString(36).substr(2, 5);
    container.ondragover = allowDrop;
    container.ondrop = (e) => dropToChain(e, container);

    const startBlock = document.createElement('div');
    startBlock.className = 'block start-block';
    const label = document.createElement('span');
    label.className = 'chain-label';
    startBlock.appendChild(label);

    if (!isRoot) {
        const delBtn = document.createElement('button');
        delBtn.className = 'del-chain-btn';
        delBtn.innerText = '×';
        delBtn.onclick = () => { if(confirm("Delete this block?")) { container.remove(); refreshUI(); saveState(); } };
        startBlock.appendChild(delBtn);
    }

    container.appendChild(startBlock);
    document.getElementById('workspace').appendChild(container);
    return container;
}

function dropToChain(ev, container) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text");
    if (activeDragData.isLink && !container.classList.contains('is-root')) { ghost.remove(); return; }
    const original = document.getElementById(id);
    if (!original || id.startsWith('c_')) { ghost.remove(); return; }
    let block = setupNewInstance(original);
    container.replaceChild(block, ghost);
    refreshUI();
    saveState();
}

function dropToSlot(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    if (ev.currentTarget.closest('#palette')) return;

    const id = ev.dataTransfer.getData("text");
    if (activeDragData.isLogic) { ghost.remove(); return; }

    const slot = ev.currentTarget;
    const chain = slot.closest('.chain-container');
    if (activeDragData.isLink && (!chain || !chain.classList.contains('is-root'))) { ghost.remove(); return; }
    
    const original = document.getElementById(id);
    if (!original || id.startsWith('c_')) { ghost.remove(); return; }
    let block = setupNewInstance(original);
    slot.innerHTML = ''; 
    slot.appendChild(block);
    ghost.remove();
    refreshUI();
    saveState();
}

function setupNewInstance(original) {
    const isPal = original.parentElement.id === "palette";
    const block = isPal ? original.cloneNode(true) : original;
    const uid = Math.random().toString(36).substr(2, 5);
    block.id = "i_" + uid;
    if (isPal) {
        block.dataset.tplSource = original.id;
        block.querySelectorAll('.slot').forEach(s => s.innerHTML = '');
    }
    block.querySelectorAll('input[type="radio"]').forEach(r => {
        r.name = r.name.split('_')[0] + "_" + uid;
    });
    return block;
}

/* === COMPILER === */

function compileBlock(el, forbidden = false) {
    const tid = el.dataset.tplSource;

    if (tid === 'tpl_logic') {
        if (forbidden) throw new Error("NESTING ERROR: Logic blocks cannot be nested.");
        const slots = el.querySelectorAll(':scope > .slot');
        const processSlot = (slot) => {
            const children = Array.from(slot.querySelectorAll(':scope > .block'));
            const results = children.map(child => compileBlock(child, true)).flat().filter(x => x !== null);
            return results.length === 1 ? results[0] : results;
        };
        const ret = { truth: processSlot(slots[0]), lie: processSlot(slots[1]) };
        if (Array.isArray(ret.truth) && ret.truth.length < 1) {
            ret.truth = "";
        }
        if (Array.isArray(ret.lie) && ret.lie.length < 1) {
            ret.lie = "";
        }
        return ret
    }

    if (tid === 'tpl_dynamic') {
        const sel = el.querySelector('select');
        if (!sel || sel.value === "None") throw new Error("LINK ERROR: No target selected.");
        return resolveChainByName(sel.value, forbidden);
    }

    if (tid === 'tpl_fact') return [["fact"]];
    if (tid === 'tpl_tag') return [[el.querySelector('.tag-sel').value]];
    if (tid === 'tpl_ptag') return [[el.querySelector('.ptag-sel').value]];
    if (tid === 'tpl_text') return el.querySelector('input').value;
    if (tid === 'tpl_static') return " ";
    if (tid === 'tpl_multi') return [Array.from(el.querySelectorAll('.inner-inputs input')).map(i => i.value)];

    if (tid === 'tpl_pronouns') {
        const m = el.querySelector('.pro-male').value.trim();
        const f = el.querySelector('.pro-female').value.trim();
        if (m === "" || f === "") throw new Error("PRONOUN ERROR: Both fields are required.");
        return [[ `${m}_${f}` ]];
    }

    if (tid === 'tpl_prev') {const val = el.querySelector('.prev-num').value;
        const num = parseInt(val);
        if (isNaN(num) || num <= 0) {
            throw new Error("PREVIOUS ITEM ERROR: Must be a positive whole number (1 or higher).");
        }
        return [[ num ]];
    }

    if (tid === 'tpl_num') {
        const low = el.querySelector('.num-low').value;
        const high = el.querySelector('.num-high').value;
        if (low === "" || high === "") throw new Error("NUMBER ERROR: Missing values.");
        const obj = { low: parseInt(low), high: parseInt(high) };
        const format = el.querySelector('input[name^="format"]:checked').value;
        const type = el.querySelector('input[name^="type"]:checked').value;
        if (format === "words" && type === "cardinal") obj.param = "words";
        else if (format === "words" && type === "ordinal") obj.param = "wordsOrdinal";
        else if (format === "digits" && type === "ordinal") obj.param = "ordinal";
        return obj;
    }
    return null;
}

function resolveChainByName(name, forbidden) {
    const allChains = document.querySelectorAll('.chain-container');
    let target = null;
    allChains.forEach(c => { if(c.querySelector('.chain-label').innerText === name) target = c; });
    if (!target) return null;
    return Array.from(target.querySelectorAll(':scope > .block:not(.start-block)')).map(b => compileBlock(b, forbidden)).flat().filter(x => x !== null);
}

function setExamples(facts, list, errorMessage='NO CONTENT') {
    const exampleEls = document.getElementsByClassName(`${facts? 'true' : 'false'}-item`);
    if (!Array.isArray(list)) {
        list = [];
    }
    if (typeof errorMessage !== 'string' || errorMessage.length < 1) {
        errorMessage = 'GENERAL';
    }
    while (list.length < exampleEls.length) {
        list.push(`ERROR! - ${errorMessage}`);
    }
    Array.from(exampleEls).forEach((el, idx) => {
        el.innerHTML = `${list[idx]}`;
    });
}

function calculate() {
    const rootChain = document.querySelector('.chain-container.is-root');
    document.getElementById('copyBtn').disabled = true;
    try {
        const blocks = Array.from(rootChain.querySelectorAll(':scope > .block:not(.start-block)'));
        const compiledBlocks = blocks.map(b => compileBlock(b, false)).flat().filter(x => x !== null);
        const final = compiledBlocks.reduce((acc, curr) => {
            if (acc.length > 0) {
                const prev = acc[acc.length - 1];
                if (typeof prev === 'string' && typeof curr === 'string') {
                    acc[acc.length - 1] = (prev + ' ' + curr).replace(/ +/g, " ")
                    return acc;
                }
            } else if (typeof curr === 'string' && curr.length >= 1) {
                acc.push(`${curr.charAt(0).toLowerCase()}${curr.slice(1)}`)
                return acc
            }
            acc.push(curr);
            return acc;
        }, []);
        lastCompiledJSON = JSON.stringify(final, null);
        let responded = false;
        standardPUT('factCheck', { template: lastCompiledJSON })
            .then((response) => {
                responded = true;
                console.log('Fact template checked!', response);
                setExamples(true, response?.data?.facts);
                setExamples(false, response?.data?.lies);
            })
            .catch((err) => {
                responded = true;
                console.error('Fact check failed!', err);
                setExamples(true, null, 'BAD: ' + err?.message);
                setExamples(false, null, 'BAD: ' + err?.message);
            })
        setTimeout(() => {
            if (!responded) {
                responded = true;
                console.error('Server did not respond to fact check request.', lastCompiledJSON);
                setExamples(true, null, 'NO SERVER RESPONSE');
                setExamples(false, null, 'NO SERVER RESPONSE');
            }
        }, 3500);
        document.getElementById('copyBtn').disabled = false;
    } catch (err) { alert("Error: " + err.message); }
}

function copyToClipboard() {
    navigator.clipboard.writeText(lastCompiledJSON)
        .then(() => alert('Copied!'))
        .catch(err => {
            console.error('Error writing to clipboard', err)
            alert('Error!')
        })
}

function clearWorkspace() {
    if (confirm("Are you sure?")) {
        localStorage.removeItem(KEY);
        document.getElementById('workspace').innerHTML = '';
        createChain(true);
        invalidateCalc();
    }
}

function handleDelete(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text");
    const el = document.getElementById(id);
    if (el && id.startsWith('i_')) {
        el.remove();
        refreshUI();
        saveState();
        ghost.remove();
    }
}

function createChain(isRoot = false) { buildChainUI(isRoot); refreshUI(); saveState(); }

function validateNumberBlock(input) {
    const block = input.closest('.num-logic');
    const lowInp = block.querySelector('.num-low');
    const highInp = block.querySelector('.num-high');
    const l = parseInt(lowInp.value.replace(/\D/g, ''));
    const h = parseInt(highInp.value.replace(/\D/g, ''));
    if (!isNaN(l) && !isNaN(h) && l > h) { lowInp.value = h; highInp.value = l; }
    saveState();
}

function modInput(btn, dir) {
    const wrap = btn.closest('.block').querySelector('.inner-inputs');
    if (dir === 1) {
        const inp = document.createElement('input');
        inp.type = 'text'; inp.style.width = "100px"; inp.oninput = invalidateCalc;
        wrap.appendChild(inp);
    } else if (wrap.children.length > 2) wrap.removeChild(wrap.lastChild);
    saveState();
}

function refreshUI() {
    const heads = document.querySelectorAll('#workspace .start-block');
    heads.forEach((h, i) => h.querySelector('.chain-label').innerText = (i === 0) ? "Root Fact" : `Block ${i}`);
    const names = Array.from(heads).map(h => h.querySelector('.chain-label').innerText);
    document.querySelectorAll('.link-sel').forEach(sel => {
        const myName = sel.closest('.chain-container')?.querySelector('.chain-label').innerText;
        const options = names.filter(n => n !== myName);
        const val = sel.dataset.pendingValue || sel.value;
        sel.innerHTML = options.length ? '' : '<option>None</option>';
        sel.disabled = !options.length;
        options.forEach(n => {
            const opt = document.createElement('option');
            opt.value = n; opt.innerText = n; sel.appendChild(opt);
        });
        if (val) sel.value = val;
        delete sel.dataset.pendingValue;
    });
}

// Manual Touch Bridge for Mobile
let touchTarget = null;

document.addEventListener('touchstart', function(e) {
    const block = e.target.closest('.block');
    if (!block || block.classList.contains('start-block')) return;
    
    touchTarget = block;
    // Manually trigger existing drag function
    const mockEvent = {
        target: block,
        dataTransfer: { 
            setData: (key, val) => { this._data = val; },
            getData: () => this._data
        }
    };
    drag(mockEvent);
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    if (!touchTarget) return;
    e.preventDefault(); // Stop page scrolling
    
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (targetEl) {
        // Manually trigger existing allowDrop/dragOver function
        const mockEv = {
            preventDefault: () => {},
            target: targetEl,
            clientY: touch.clientY,
            clientX: touch.clientX,
            dataTransfer: { dropEffect: 'move' }
        };
        allowDrop(mockEv);
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (!touchTarget) return;
    
    const touch = e.changedTouches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    
    const palette = targetEl?.closest('#palette');
    const slot = targetEl?.closest('.slot');
    const chain = targetEl?.closest('.chain-container');
    
    const mockEv = {
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: slot || chain || palette,
        target: targetEl,
        dataTransfer: { getData: () => touchTarget.id }
    };

    if (palette) {
        handleDelete(mockEv); // Trigger existing delete logic
    } else if (slot) {
        dropToSlot(mockEv);
    } else if (chain) {
        dropToChain(mockEv, chain);
    }
    
    touchTarget = null;
    if (ghost.parentNode) ghost.remove();
}, { passive: false });

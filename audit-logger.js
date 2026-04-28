(function () {
    if (window.__HORIMETRO_AUDIT_LOGGER__) return;
    window.__HORIMETRO_AUDIT_LOGGER__ = true;

    const currentScript = document.currentScript;
    const supabaseUrl = 'https://rrxkmlcxrextfxfrayfp.supabase.co';
    const supabaseKey = 'sb_publishable_CyAbN__kFsKDcDo0eYSlBg_oSEoKrtd';
    const auditTable = 'audit_logs';
    const moduleName = (currentScript && currentScript.dataset.auditModule)
        || (location.pathname.split(/[\\/]/).pop() || 'index.html').replace(/\.html$/i, '')
        || 'sistema';

    const queue = [];
    let flushTimer = null;
    let isFlushing = false;
    let lastFieldLog = new Map();

    const truncate = (value, max = 8000) => {
        const text = String(value === undefined || value === null ? '' : value);
        return text.length > max ? text.slice(0, max) : text;
    };

    const normalizePlantId = (value) => {
        const text = String(value || '').trim();
        return text || 'cambui';
    };

    const getPlantId = () => {
        try {
            const params = new URLSearchParams(location.search);
            const fromUrl = params.get('plantId') || params.get('plant') || params.get('unidade');
            if (fromUrl) return normalizePlantId(fromUrl);
        } catch (e) {}

        try {
            const stored = localStorage.getItem('selectedPlantId');
            if (stored) return normalizePlantId(stored);
        } catch (e) {}

        return 'cambui';
    };

    const getUserEmail = () => {
        try {
            for (let i = 0; i < localStorage.length; i += 1) {
                const key = localStorage.key(i);
                if (!key || !/auth-token|supabase/i.test(key)) continue;
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                const email = parsed?.user?.email || parsed?.currentSession?.user?.email || parsed?.session?.user?.email;
                if (email) return email;
            }
        } catch (e) {}

        try {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            if (profile?.email) return profile.email;
        } catch (e) {}

        return null;
    };

    const safeJson = (value) => {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return JSON.stringify({ raw: String(value) });
        }
    };

    const sanitizeValue = (element) => {
        if (!element) return null;
        const type = String(element.type || element.tagName || '').toLowerCase();
        const name = `${element.name || ''} ${element.id || ''}`.toLowerCase();
        if (type === 'password' || /senha|password|token|apikey|api_key|secret|key/.test(name)) {
            return '[protegido]';
        }
        if (type === 'checkbox' || type === 'radio') return !!element.checked;
        if (type === 'file') return Array.from(element.files || []).map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        }));
        return truncate(element.value, 300);
    };

    const elementLabel = (element) => {
        if (!element) return '';
        const direct = element.getAttribute('aria-label') || element.getAttribute('title') || element.dataset.auditLabel;
        if (direct) return truncate(direct, 180);
        if (element.id) {
            const escapedId = window.CSS && CSS.escape
                ? CSS.escape(element.id)
                : String(element.id).replace(/"/g, '\\"');
            const label = document.querySelector(`label[for="${escapedId}"]`);
            if (label?.textContent) return truncate(label.textContent.trim(), 180);
        }
        const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
        return truncate(text || element.name || element.id || element.tagName, 180);
    };

    const getElementPath = (element) => {
        if (!element) return '';
        const parts = [];
        let node = element;
        while (node && node.nodeType === 1 && parts.length < 4) {
            let part = node.tagName.toLowerCase();
            if (node.id) {
                part += `#${node.id}`;
                parts.unshift(part);
                break;
            }
            if (node.className && typeof node.className === 'string') {
                const cls = node.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
                if (cls) part += `.${cls}`;
            }
            parts.unshift(part);
            node = node.parentElement;
        }
        return parts.join(' > ');
    };

    const guessFrenteId = (details) => {
        const candidates = [
            details?.frente_id,
            details?.frenteId,
            details?.frente,
            details?.front,
            details?.selectedFrente
        ];
        for (const candidate of candidates) {
            const text = String(candidate || '').trim();
            if (text) return truncate(text, 120);
        }
        return 'SISTEMA';
    };

    const buildDetails = (action, entity, details) => ({
        module: moduleName,
        page: document.title || location.pathname,
        action,
        entity,
        details: details || {},
        path: location.pathname,
        query: location.search,
        url: location.href,
        userAgent: navigator.userAgent,
        capturedAt: new Date().toISOString()
    });

    const log = (action, entity = 'sistema', details = {}) => {
        if (!action) return;
        const payloadDetails = buildDetails(action, entity, details);
        queue.push({
            plant_id: getPlantId(),
            frente_id: guessFrenteId(details),
            date: new Date().toISOString().slice(0, 10),
            user_email: getUserEmail(),
            action: truncate(String(action).toUpperCase(), 120),
            details: truncate(safeJson(payloadDetails), 8000),
            timestamp: new Date().toISOString()
        });

        if (queue.length >= 10) {
            flush();
        } else if (!flushTimer) {
            flushTimer = setTimeout(flush, 1200);
        }
    };

    const flush = async (useKeepalive = false) => {
        if (isFlushing || queue.length === 0) return;
        isFlushing = true;
        clearTimeout(flushTimer);
        flushTimer = null;
        const rows = queue.splice(0, 25);

        try {
            await fetch(`${supabaseUrl}/rest/v1/${auditTable}`, {
                method: 'POST',
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify(rows),
                keepalive: !!useKeepalive
            });
        } catch (e) {
            rows.forEach(row => queue.unshift(row));
        } finally {
            isFlushing = false;
            if (queue.length > 0 && !flushTimer) {
                flushTimer = setTimeout(flush, 2500);
            }
        }
    };

    const cleanSupabaseUrl = (url) => {
        try {
            const parsed = new URL(url, location.href);
            return `${parsed.origin}${parsed.pathname}`;
        } catch (e) {
            return truncate(url, 500);
        }
    };

    const extractRestTable = (url) => {
        try {
            const parsed = new URL(url, location.href);
            const marker = '/rest/v1/';
            const idx = parsed.pathname.indexOf(marker);
            if (idx === -1) return '';
            return parsed.pathname.slice(idx + marker.length).split('/')[0] || '';
        } catch (e) {
            return '';
        }
    };

    const summarizeBody = (body) => {
        if (!body || typeof body !== 'string') return null;
        try {
            const parsed = JSON.parse(body);
            if (Array.isArray(parsed)) {
                return {
                    rows: parsed.length,
                    keys: parsed[0] && typeof parsed[0] === 'object' ? Object.keys(parsed[0]).slice(0, 20) : []
                };
            }
            if (parsed && typeof parsed === 'object') {
                return { keys: Object.keys(parsed).slice(0, 30) };
            }
        } catch (e) {}
        return { size: body.length };
    };

    const normalizeLegacyEquipmentSelect = (input, method) => {
        const currentUrl = String(input?.url || input || '');
        if (method !== 'GET' || !/\/rest\/v1\/equipments_/.test(currentUrl) || !/[?&]select=/.test(currentUrl)) {
            return { input, url: currentUrl };
        }

        try {
            const parsedUrl = new URL(currentUrl, window.location.origin);
            const selectedColumns = String(parsedUrl.searchParams.get('select') || '').trim().toLowerCase();
            if (selectedColumns !== 'frota,frente') return { input, url: currentUrl };

            parsedUrl.searchParams.set('select', 'frota');
            let normalizedUrl = parsedUrl.toString();
            if (!/^https?:\/\//i.test(currentUrl) && normalizedUrl.startsWith(window.location.origin)) {
                normalizedUrl = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
            }

            const normalizedInput = typeof Request !== 'undefined' && input instanceof Request
                ? new Request(normalizedUrl, input)
                : normalizedUrl;

            return { input: normalizedInput, url: normalizedUrl };
        } catch (error) {
            const normalizedUrl = currentUrl.replace(/([?&]select=)frota%2Cfrente/i, '$1frota');
            return {
                input: normalizedUrl === currentUrl ? input : normalizedUrl,
                url: normalizedUrl
            };
        }
    };

    const installFetchAudit = () => {
        if (!window.fetch || window.fetch.__horimetroAuditWrapped) return;
        const originalFetch = window.fetch.bind(window);
        const wrappedFetch = async (input, init = {}) => {
            const method = String(init?.method || input?.method || 'GET').toUpperCase();
            const normalizedRequest = normalizeLegacyEquipmentSelect(input, method);
            const requestInput = normalizedRequest.input;
            const url = normalizedRequest.url;
            const table = extractRestTable(url);
            const shouldAudit = table
                && table !== auditTable
                && /\/rest\/v1\//.test(url)
                && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

            const response = await originalFetch(requestInput, init);

            if (shouldAudit) {
                log(`DB_${method}`, table, {
                    table,
                    method,
                    status: response.status,
                    ok: response.ok,
                    endpoint: cleanSupabaseUrl(url),
                    body: summarizeBody(init?.body)
                });
            }

            return response;
        };
        wrappedFetch.__horimetroAuditWrapped = true;
        window.fetch = wrappedFetch;
    };

    const installStorageAudit = () => {
        try {
            if (Storage.prototype.setItem.__horimetroAuditWrapped) return;
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function (key, value) {
                const result = originalSetItem.apply(this, arguments);
                const storageName = this === localStorage ? 'localStorage' : 'sessionStorage';
                const textKey = String(key || '');
                const sensitive = /auth-token|senha|password|token|apikey|api_key|secret|gemini|deepseek/i.test(textKey);
                const noisy = /^lastReminderTimestamp$/.test(textKey);
                if (storageName === 'localStorage' && !sensitive && !noisy) {
                    log('LOCAL_SAVE', textKey, {
                        storage: storageName,
                        key: truncate(textKey, 180),
                        size: String(value || '').length
                    });
                }
                return result;
            };
            Storage.prototype.setItem.__horimetroAuditWrapped = true;
        } catch (e) {}
    };

    const installDomAudit = () => {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]');
            if (!target) return;
            log('CLICK', 'interface', {
                label: elementLabel(target),
                id: target.id || null,
                name: target.name || null,
                href: target.getAttribute('href') || null,
                element: getElementPath(target)
            });
        }, true);

        document.addEventListener('change', (event) => {
            const target = event.target;
            if (!target || !/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
            const key = `${target.id || target.name || getElementPath(target)}:${target.type || target.tagName}`;
            const now = Date.now();
            const last = lastFieldLog.get(key) || 0;
            if (now - last < 500) return;
            lastFieldLog.set(key, now);
            log('FIELD_CHANGE', 'campo', {
                label: elementLabel(target),
                id: target.id || null,
                name: target.name || null,
                type: target.type || target.tagName,
                value: sanitizeValue(target),
                element: getElementPath(target)
            });
        }, true);

        document.addEventListener('submit', (event) => {
            const form = event.target;
            log('FORM_SUBMIT', 'formulario', {
                id: form.id || null,
                name: form.name || null,
                label: elementLabel(form),
                element: getElementPath(form)
            });
        }, true);
    };

    const installErrorAudit = () => {
        window.addEventListener('error', (event) => {
            log('PAGE_ERROR', 'erro', {
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            log('PROMISE_ERROR', 'erro', {
                message: event.reason?.message || String(event.reason || ''),
                stack: truncate(event.reason?.stack || '', 1200)
            });
        });
    };

    window.HorimetroAudit = {
        log,
        flush,
        getPlantId
    };

    installFetchAudit();
    installStorageAudit();
    installDomAudit();
    installErrorAudit();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            log('PAGE_OPEN', 'pagina', { title: document.title, module: moduleName });
        }, { once: true });
    } else {
        log('PAGE_OPEN', 'pagina', { title: document.title, module: moduleName });
    }

    window.addEventListener('beforeunload', () => flush(true));
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush(true);
    });
})();

(function (window) {
    'use strict';

    const SUPABASE_URL = 'https://rrxkmlcxrextfxfrayfp.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_CyAbN__kFsKDcDo0eYSlBg_oSEoKrtd';
    const BACKUP_STORAGE_KEY = 'horimetro_complete_backup_last';
    const LOCAL_SNAPSHOT_KEY = 'horimetro_local_snapshot_last';
    const VERSION = 1;
    const PAGE_SIZE = 1000;

    const TABLES = [
        { name: 'profiles', conflict: 'id' },
        { name: 'shift_config', conflict: 'plant_id,shift_name' },
        { name: 'audit_logs' },
        { name: 'daily_reports_cambui', conflict: 'frente_id,date' },
        { name: 'daily_reports_panorama', conflict: 'frente_id,date' },
        { name: 'daily_reports_vale_verdao', conflict: 'frente_id,date' },
        { name: 'daily_reports_floresta', conflict: 'frente_id,date' },
        { name: 'frentes_cambui' },
        { name: 'frentes_panorama' },
        { name: 'frentes_vale_verdao' },
        { name: 'frentes_floresta' },
        { name: 'equipments_cambui' },
        { name: 'equipments_panorama' },
        { name: 'equipments_vale_verdao' },
        { name: 'equipments_floresta' },
        { name: 'rain_logs' },
        { name: 'planting_daily_logs' },
        { name: 'availability_logs' },
        { name: 'farms' },
        { name: 'frente_targets' },
        { name: 'harvest_schedule' },
        { name: 'harvest_frentes' },
        { name: 'harvest_goals' },
        { name: 'harvest_daily_entries' },
        { name: 'potencial_data', conflict: 'plant_id' },
        { name: 'cota_data', conflict: 'plant_id' },
        { name: 'entrega_hora_data', conflict: 'plant_id' },
        { name: 'meta_data', conflict: 'plant_id' }
    ];

    const backupHeaders = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };

    function safeJsonParse(value, fallback = null) {
        if (value === null || typeof value === 'undefined') return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function shouldSkipStorageKey(key) {
        const normalized = String(key || '').toLowerCase();
        if (!normalized) return true;
        if (normalized === BACKUP_STORAGE_KEY.toLowerCase()) return true;
        if (normalized === LOCAL_SNAPSHOT_KEY.toLowerCase()) return true;
        if (normalized.includes('auth-token')) return true;
        if (normalized.includes('supabase') && normalized.includes('auth')) return true;
        return false;
    }

    function collectLocalStorage() {
        const items = {};
        try {
            for (let i = 0; i < localStorage.length; i += 1) {
                const key = localStorage.key(i);
                if (shouldSkipStorageKey(key)) continue;
                items[key] = localStorage.getItem(key);
            }
        } catch (error) {
            return { items, error: String(error && error.message ? error.message : error) };
        }
        return { items, count: Object.keys(items).length };
    }

    function readStoredBackup() {
        return safeJsonParse(localStorage.getItem(BACKUP_STORAGE_KEY), null)
            || safeJsonParse(localStorage.getItem(LOCAL_SNAPSHOT_KEY), null);
    }

    function storeBackup(backup) {
        try {
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
        } catch (error) {
            console.warn('Nao foi possivel guardar backup completo no localStorage:', error);
        }
    }

    function storeLocalSnapshot(reason) {
        const snapshot = {
            version: VERSION,
            app: 'horimetro',
            kind: 'local-snapshot',
            reason: reason || 'manual',
            createdAt: new Date().toISOString(),
            sourceUrl: window.location.href,
            localStorage: collectLocalStorage()
        };
        try {
            localStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(snapshot));
        } catch (error) {
            console.warn('Nao foi possivel guardar snapshot local:', error);
        }
        return snapshot;
    }

    function downloadJson(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function getTableUrl(tableName, params = {}) {
        const query = new URLSearchParams(params);
        return `${SUPABASE_URL}/rest/v1/${tableName}?${query.toString()}`;
    }

    async function fetchTableRows(tableName) {
        const rows = [];
        let offset = 0;

        while (true) {
            const response = await fetch(getTableUrl(tableName, {
                select: '*',
                limit: String(PAGE_SIZE),
                offset: String(offset)
            }), {
                method: 'GET',
                headers: backupHeaders
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
            }

            const page = await response.json();
            const pageRows = Array.isArray(page) ? page : [];
            rows.push(...pageRows);

            if (pageRows.length < PAGE_SIZE) break;
            offset += PAGE_SIZE;
        }

        return rows;
    }

    async function exportBackup(options = {}) {
        const tables = {};
        const errors = [];

        for (const table of TABLES) {
            try {
                const rows = await fetchTableRows(table.name);
                tables[table.name] = {
                    rows,
                    count: rows.length,
                    exportedAt: new Date().toISOString()
                };
            } catch (error) {
                const message = String(error && error.message ? error.message : error);
                tables[table.name] = {
                    rows: [],
                    count: 0,
                    error: message,
                    exportedAt: new Date().toISOString()
                };
                errors.push({ table: table.name, error: message });
            }
        }

        const backup = {
            version: VERSION,
            app: 'horimetro',
            createdAt: new Date().toISOString(),
            sourceUrl: window.location.href,
            supabaseUrl: SUPABASE_URL,
            tables,
            localStorage: collectLocalStorage(),
            summary: {
                tablesTotal: TABLES.length,
                tablesOk: TABLES.length - errors.length,
                tablesWithError: errors.length,
                rowsTotal: Object.values(tables).reduce((sum, table) => sum + (table.count || 0), 0),
                localStorageKeys: Object.keys((tables && {}) || {}).length
            },
            errors
        };

        backup.summary.localStorageKeys = Object.keys(backup.localStorage.items || {}).length;
        storeBackup(backup);

        if (options.download !== false) {
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadJson(backup, `backup-horimetro-completo-${stamp}.json`);
        }

        return backup;
    }

    function normalizeLocalStorageBackup(localStorageBackup) {
        if (!localStorageBackup || typeof localStorageBackup !== 'object') return { items: {} };
        if (localStorageBackup.items && typeof localStorageBackup.items === 'object') return localStorageBackup;
        return {
            items: localStorageBackup,
            count: Object.keys(localStorageBackup).length
        };
    }

    function normalizeBackup(raw) {
        if (!raw || typeof raw !== 'object') throw new Error('Arquivo de backup invalido.');
        if (raw.app !== 'horimetro' && !raw.tables && !raw.localStorage && !raw.items && raw.kind !== 'local-snapshot') {
            throw new Error('Este arquivo nao parece ser um backup do Horimetro.');
        }

        const backup = { ...raw };
        if (!backup.app) backup.app = 'horimetro';
        if (!backup.localStorage && backup.items && typeof backup.items === 'object') {
            backup.localStorage = { items: backup.items, count: Object.keys(backup.items).length };
        }
        backup.localStorage = normalizeLocalStorageBackup(backup.localStorage);
        if (!backup.tables || typeof backup.tables !== 'object') backup.tables = {};
        return backup;
    }

    function isRemoteUnavailableError(error) {
        const status = Number(error && error.status) || 0;
        const message = String(error && error.message ? error.message : error).toLowerCase();
        return status === 401
            || status === 402
            || status === 403
            || status === 429
            || status >= 500
            || message.includes('failed to fetch')
            || message.includes('network')
            || message.includes('payment required')
            || message.includes('jwt')
            || message.includes('auth')
            || message.includes('fetch');
    }

    function restoreLocalStorage(backup) {
        const items = backup && backup.localStorage && backup.localStorage.items;
        if (!items || typeof items !== 'object') return 0;

        let restored = 0;
        Object.entries(items).forEach(([key, value]) => {
            if (shouldSkipStorageKey(key)) return;
            try {
                if (typeof value === 'undefined') return;
                const storageValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, storageValue === undefined ? '' : storageValue);
                restored += 1;
            } catch (error) {
                console.warn(`Nao foi possivel restaurar localStorage ${key}:`, error);
            }
        });
        return restored;
    }

    function chunkRows(rows, size = 200) {
        const chunks = [];
        for (let i = 0; i < rows.length; i += size) {
            chunks.push(rows.slice(i, i + size));
        }
        return chunks;
    }

    async function upsertTableRows(table, rows) {
        if (!Array.isArray(rows) || rows.length === 0) return { imported: 0, skipped: true };

        let imported = 0;
        for (const chunk of chunkRows(rows)) {
            const params = {};
            if (table.conflict) params.on_conflict = table.conflict;
            const response = await fetch(getTableUrl(table.name, params), {
                method: 'POST',
                headers: {
                    ...backupHeaders,
                    Prefer: 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(chunk)
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                const error = new Error(`${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
                error.status = response.status;
                error.table = table.name;
                throw error;
            }

            imported += chunk.length;
        }

        return { imported };
    }

    async function importBackupObject(rawBackup, options = {}) {
        const backup = normalizeBackup(rawBackup);
        const result = {
            accepted: true,
            localStorageRestored: 0,
            tablesImported: {},
            errors: [],
            remoteAttempted: false,
            remoteSkipped: false,
            remoteSkippedReason: ''
        };

        storeBackup(backup);
        result.localStorageRestored = restoreLocalStorage(backup);

        if (options.restoreRemote !== false && backup.tables && typeof backup.tables === 'object') {
            for (const table of TABLES) {
                const tableBackup = backup.tables[table.name];
                if (!tableBackup || !Array.isArray(tableBackup.rows) || tableBackup.rows.length === 0) {
                    result.tablesImported[table.name] = { imported: 0, skipped: true };
                    continue;
                }

                try {
                    result.remoteAttempted = true;
                    result.tablesImported[table.name] = await upsertTableRows(table, tableBackup.rows);
                } catch (error) {
                    const message = String(error && error.message ? error.message : error);
                    result.tablesImported[table.name] = { imported: 0, error: message };
                    result.errors.push({ table: table.name, error: message });
                    if (isRemoteUnavailableError(error)) {
                        result.remoteSkipped = true;
                        result.remoteSkippedReason = message;
                        break;
                    }
                }
            }
        }

        storeLocalSnapshot('import');
        window.dispatchEvent(new CustomEvent('horimetro-backup-imported', { detail: result }));
        return result;
    }

    async function importBackupFile(file, options = {}) {
        if (!file) throw new Error('Nenhum arquivo selecionado.');
        const text = (await file.text()).replace(/^\uFEFF/, '').trim();
        if (!text) throw new Error('Arquivo de backup vazio.');
        const backup = safeJsonParse(text, null);
        if (!backup) throw new Error('Arquivo JSON invalido.');
        return importBackupObject(backup, options);
    }

    function getStoredLocalStorageItems() {
        const stored = readStoredBackup();
        return stored && stored.localStorage && stored.localStorage.items
            ? stored.localStorage.items
            : {};
    }

    function getStorageValue(key) {
        const direct = localStorage.getItem(key);
        if (direct !== null) return direct;
        const storedItems = getStoredLocalStorageItems();
        return Object.prototype.hasOwnProperty.call(storedItems, key) ? storedItems[key] : null;
    }

    function getParsedStorageValue(key, fallback = null) {
        return safeJsonParse(getStorageValue(key), fallback);
    }

    function getHorimetroCache(plantId) {
        const dataKey = `cachedData_${plantId}`;
        const typeKey = `cachedTypes_${plantId}`;
        const data = getParsedStorageValue(dataKey, null);
        const types = getParsedStorageValue(typeKey, null);

        if (data && typeof data === 'object') {
            return {
                data,
                types: types && typeof types === 'object' ? types : {},
                source: localStorage.getItem(dataKey) !== null ? 'cache local' : 'backup importado'
            };
        }

        return null;
    }

    window.HorimetroBackupManager = {
        version: VERSION,
        tables: TABLES.map(table => ({ ...table })),
        exportBackup,
        importBackupFile,
        importBackupObject,
        storeLocalSnapshot,
        readStoredBackup,
        getStorageValue,
        getParsedStorageValue,
        getHorimetroCache
    };

    try {
        window.addEventListener('beforeunload', () => storeLocalSnapshot('beforeunload'));
    } catch (error) {
        console.warn('Nao foi possivel registrar snapshot local automatico:', error);
    }
})(window);

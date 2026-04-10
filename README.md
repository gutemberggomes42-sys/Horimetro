# Horímetro

Projeto em HTML único (standalone).

## Rodar

- Abra `index.html` no navegador.

## Build

- `npm run build` prepara a versão standalone em `dist/`.
- `npm run build:android` prepara `dist/`, sincroniza o Capacitor e gera o APK Android.

## Safra → Potencial

- A tela **Potencial** é carregada de `potencial.html` e sincroniza dados no Supabase por `plantId`.

### SQL (Supabase)

Crie a tabela abaixo para habilitar o sincronismo:

```sql
create table if not exists potencial_data (
  plant_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table potencial_data enable row level security;

create policy "potencial_data_select"
on potencial_data for select
using (true);

create policy "potencial_data_insert"
on potencial_data for insert
with check (true);

create policy "potencial_data_update"
on potencial_data for update
using (true)
with check (true);
```

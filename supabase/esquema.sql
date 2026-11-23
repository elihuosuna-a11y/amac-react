create table public.perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  rol         text not null default 'candidato'
              check (rol in ('candidato', 'empresa', 'admin')),
  nombre      text not null,
  telefono    text,
  edad        int  check (edad between 18 and 120),
  colonia     text,
  experiencia text,
  giro        text,
  aprobado    boolean not null default false,
  creado_en   timestamptz not null default now()
);

create table public.vacantes (
  id                bigint generated always as identity primary key,
  empresa_id        uuid not null references public.perfiles (id) on delete cascade,
  titulo            text not null,
  sueldo            numeric(10,2) not null check (sueldo > 0),
  ubicacion         text not null,
  horario           text not null
                    check (horario in ('Matutino', 'Vespertino', 'Medio tiempo', 'Fines de semana')),
  categoria         text not null,
  descripcion       text not null,
  requisitos        text not null,
  prestaciones      text not null,
  telefono_contacto text,
  estado            text not null default 'activa'
                    check (estado in ('activa', 'pausada', 'cerrada')),
  creada_en         timestamptz not null default now()
);

create table public.solicitudes (
  id                     bigint generated always as identity primary key,
  vacante_id             bigint not null references public.vacantes (id) on delete cascade,
  candidato_id           uuid   not null references public.perfiles (id) on delete cascade,
  estatus                text   not null default 'Enviada'
                         check (estatus in ('Enviada', 'En revisión', 'Aceptada', 'Rechazada', 'Cancelada')),
  creada_en              timestamptz not null default now(),
  estatus_actualizado_en timestamptz not null default now(),
  unique (vacante_id, candidato_id)
);

create index vacantes_empresa_idx    on public.vacantes (empresa_id);
create index vacantes_estado_idx     on public.vacantes (estado);
create index solicitudes_cand_idx    on public.solicitudes (candidato_id);
create index solicitudes_vacante_idx on public.solicitudes (vacante_id);

create function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, rol, nombre, telefono, edad, colonia, experiencia, giro)
  values (
    new.id,
    case when new.raw_user_meta_data->>'rol' = 'empresa' then 'empresa' else 'candidato' end,
    coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), 'Sin nombre'),
    new.raw_user_meta_data->>'telefono',
    nullif(new.raw_user_meta_data->>'edad', '')::int,
    new.raw_user_meta_data->>'colonia',
    new.raw_user_meta_data->>'experiencia',
    new.raw_user_meta_data->>'giro'
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create function public.marcar_cambio_estatus()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.estatus is distinct from old.estatus then
    new.estatus_actualizado_en := now();
  end if;
  return new;
end;
$$;

create trigger al_cambiar_estatus
  before update on public.solicitudes
  for each row execute function public.marcar_cambio_estatus();

create function public.mi_rol()
returns text language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = auth.uid()
$$;

create function public.candidato_aprobado()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'candidato' and aprobado
  )
$$;

create function public.candidato_aplico(vid bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.solicitudes
    where vacante_id = vid and candidato_id = auth.uid()
  )
$$;

create function public.empresa_ve_candidato(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.solicitudes s
    join public.vacantes v on v.id = s.vacante_id
    where s.candidato_id = cid and v.empresa_id = auth.uid()
  )
$$;

create function public.vacante_activa(vid bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.vacantes where id = vid and estado = 'activa')
$$;

create function public.cambiar_aprobacion(cid uuid, valor boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.mi_rol() is distinct from 'admin' then
    raise exception 'Solo AMAC puede aprobar candidatos' using errcode = '42501';
  end if;
  update public.perfiles set aprobado = valor where id = cid and rol = 'candidato';
end;
$$;

revoke execute on function public.cambiar_aprobacion(uuid, boolean) from public, anon;
grant  execute on function public.cambiar_aprobacion(uuid, boolean) to authenticated;

alter table public.perfiles    enable row level security;
alter table public.vacantes    enable row level security;
alter table public.solicitudes enable row level security;

create policy "Cada quien ve su perfil" on public.perfiles
  for select using (id = auth.uid());

create policy "Todos ven los perfiles de empresas" on public.perfiles
  for select using (rol = 'empresa');

create policy "La empresa ve a quien aplicó a sus vacantes" on public.perfiles
  for select using (public.empresa_ve_candidato(id));

create policy "AMAC ve todos los perfiles" on public.perfiles
  for select using (public.mi_rol() = 'admin');

create policy "Cada quien edita su perfil" on public.perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.perfiles from anon, authenticated;
grant update (nombre, telefono, edad, colonia, experiencia, giro)
  on public.perfiles to authenticated;

create policy "Ver vacantes activas o las propias" on public.vacantes
  for select using (estado = 'activa' or empresa_id = auth.uid());

create policy "El candidato sigue viendo las vacantes a las que aplicó" on public.vacantes
  for select using (public.candidato_aplico(id));

create policy "Solo empresas publican, a su nombre" on public.vacantes
  for insert with check (empresa_id = auth.uid() and public.mi_rol() = 'empresa');

create policy "La empresa edita sus vacantes" on public.vacantes
  for update using (empresa_id = auth.uid()) with check (empresa_id = auth.uid());

create policy "Candidato ve las suyas; empresa ve las de sus vacantes" on public.solicitudes
  for select using (
    candidato_id = auth.uid()
    or exists (select 1 from public.vacantes v
               where v.id = vacante_id and v.empresa_id = auth.uid())
  );

create policy "Solo candidatos aprobados se postulan a vacantes activas" on public.solicitudes
  for insert with check (
    candidato_id = auth.uid()
    and estatus = 'Enviada'
    and public.candidato_aprobado()
    and public.vacante_activa(vacante_id)
  );

create policy "Candidato cancela si no está resuelta" on public.solicitudes
  for update
  using (candidato_id = auth.uid() and estatus in ('Enviada', 'En revisión'))
  with check (candidato_id = auth.uid() and estatus = 'Cancelada');

create policy "Empresa cambia el estatus" on public.solicitudes
  for update
  using (
    estatus <> 'Cancelada'
    and exists (select 1 from public.vacantes v
                where v.id = vacante_id and v.empresa_id = auth.uid())
  )
  with check (
    estatus in ('En revisión', 'Aceptada', 'Rechazada')
    and exists (select 1 from public.vacantes v
                where v.id = vacante_id and v.empresa_id = auth.uid())
  );

revoke update on public.solicitudes from anon, authenticated;
grant update (estatus) on public.solicitudes to authenticated;

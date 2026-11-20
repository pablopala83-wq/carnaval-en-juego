-- Proposed addition for the example campaign. Does not insert, update or delete votes.
-- Apply only after approval to add this read-only counter to Supabase.
create or replace function public.get_demo_community_progress()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $function$
declare
  real_count bigint;
  retired bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select count(f.id) into real_count
  from public.fallos f
  join public.performances p on p.id = f.performance_id
  join public.events e on e.id = p.event_id
  where e.slug = 'concurso-oficial-2027'
    and p.status = 'completed'
    and f.created_at >= timestamptz '2026-11-20T13:30:28Z';

  retired := least(200::bigint, real_count / 2);
  return jsonb_build_object(
    'campaign', 'carnaval-2027-examples-v1',
    'new_real_fallos', real_count,
    'total_examples', 200,
    'real_per_example', 2,
    'retired_examples', retired,
    'remaining_examples', 200 - retired
  );
end;
$function$;
revoke all on function public.get_demo_community_progress() from public, anon;
grant execute on function public.get_demo_community_progress() to authenticated;
comment on function public.get_demo_community_progress() is
'Only a global count for retiring clearly labelled example data. No individual votes, scores, user identities or preferences are returned. No real records are changed.';

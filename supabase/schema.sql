
-- T_PROFILES: Extend default auth.users with app-specific info
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  organization text,
  role_title text,
  signature_url text, -- Added for persistent e-signatures
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Enable RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- T_LOANS: Central Transaction Entity
create table loans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  borrower_name text not null,
  amount numeric not null,
  currency text default 'NGN',
  loan_type text, -- Secured Term, Revolving, etc.
  duration_months integer,
  start_date date,
  status text default 'Active', -- Active, Perfected, Defaulted, Closed
  pipeline_stage text default 'Application', -- Workflow Stage
  tracking_data jsonb default '{}'::jsonb, -- Store dynamic tracking info
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Loans
alter table loans enable row level security;

create policy "Users can CRUD own loans." on loans
  for all using (auth.uid() = user_id);

-- T_DOCUMENTS: Store LMA generated documents
create table documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  loan_id uuid references loans(id), -- Link to Loan
  title text default 'Untitled Document',
  content text,
  template_type text,
  status text default 'draft', -- draft, review, final
  file_url text, -- Path to PDF in Storage
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Documents
alter table documents enable row level security;

create policy "Users can CRUD own documents." on documents
  for all using (auth.uid() = user_id);

-- T_FILINGS: Store CAC Filing History
create table filings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  loan_id uuid references loans(id), -- Link to Loan
  document_id uuid references documents(id), -- Link to source document
  reference_id text not null,
  entity_name text not null,
  rc_number text,
  filing_type text,
  charge_amount numeric,
  charge_currency text default 'NGN',
  asset_description text,
  metadata jsonb default '{}'::jsonb,
  status text default 'Pending', -- Pending, Submitted, Perfected, Query
  submission_date timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Enable RLS for Filings
alter table filings enable row level security;

create policy "Users can CRUD own filings." on filings
  for all using (auth.uid() = user_id);

-- T_KYC_REQUESTS: Store KYC Verifications
create table kyc_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  loan_id uuid references loans(id), -- Link to Loan
  entity_name text,
  verification_type text, -- Identity, Document, Liveness
  status text default 'Pending',
  risk_score numeric,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for KYC
alter table kyc_requests enable row level security;

create policy "Users can CRUD own kyc." on kyc_requests
  for all using (auth.uid() = user_id);

-- T_SIGNATURES: Audit Trail for E-Signatures
create table signatures (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  document_id uuid references documents(id),
  signature_url text not null,
  ip_address text,
  signed_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Signatures
alter table signatures enable row level security;

create policy "Users can insert own signatures" on signatures
  for insert with check (auth.uid() = user_id);

create policy "Users can view own signatures" on signatures
  for select using (auth.uid() = user_id);

create policy "Users can read own KYC requests." on kyc_requests
  for select using (auth.uid() = user_id);

create policy "Users can update own KYC requests." on kyc_requests
  for update using (auth.uid() = user_id);

------------------------------------------------------------
-- VIEWS: Activity Feed for Dashboard
------------------------------------------------------------

-- Drop existing view if it exists
DROP VIEW IF EXISTS activity_feed;

-- Unified activity feed view
-- Unified activity feed view
CREATE OR REPLACE VIEW activity_feed AS
-- Loans: loan_created events
SELECT 
    'loan_created' as event_type,
    l.id::text as event_id,
    l.borrower_name as entity_name,
    'Loan Created: ' || l.borrower_name || ' (' || COALESCE(l.loan_type, 'Unspecified') || ')' as description,
    l.status as metadata,
    l.created_at as event_timestamp,
    l.user_id,
    l.id::uuid as loan_id
FROM loans l

UNION ALL

-- Filings: filing_submitted events
SELECT 
    'filing_submitted' as event_type,
    f.id::text as event_id,
    f.entity_name,
    'Filing Submitted: ' || COALESCE(f.filing_type, 'CAC Filing') || ' for ' || f.entity_name as description,
    f.status as metadata,
    COALESCE(f.submission_date, f.updated_at) as event_timestamp,
    f.user_id,
    f.loan_id
FROM filings f

UNION ALL

-- Documents: document_generated events
SELECT 
    'document_generated' as event_type,
    d.id::text as event_id,
    COALESCE(d.title, 'Untitled Document') as entity_name,
    'Document Generated: ' || COALESCE(d.title, 'Untitled') || ' (' || COALESCE(d.template_type, 'Custom') || ')' as description,
    d.status as metadata,
    d.created_at as event_timestamp,
    d.user_id,
    d.loan_id
FROM documents d

UNION ALL

-- KYC Requests: kyc_completed events (only approved)
SELECT 
    'kyc_completed' as event_type,
    k.id::text as event_id,
    k.entity_name,
    'KYC Approved: ' || k.entity_name as description,
    'Approved' as metadata,
    k.created_at as event_timestamp,
    k.user_id,
    k.loan_id::uuid as loan_id
FROM kyc_requests k
WHERE k.status = 'Approved'

ORDER BY event_timestamp DESC;

-- Grant access
GRANT SELECT ON activity_feed TO authenticated;

-- Documentation
COMMENT ON VIEW activity_feed IS 'Unified activity feed showing recent events across loans, filings, documents, and KYC requests. Used by Dashboard component.';


-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- T_PROFILES: Extend default auth.users with app-specific info
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  organization text,
  role_title text,
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

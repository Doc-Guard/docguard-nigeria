-- Drop existing view if it exists
DROP VIEW IF EXISTS activity_feed;

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
WHERE k.status = 'Approved';

-- Grant access
GRANT SELECT ON activity_feed TO authenticated;

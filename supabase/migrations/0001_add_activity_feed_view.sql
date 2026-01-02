-- Migration: Add activity_feed view for Dashboard
-- Version: 0.6.0
-- Description: Creates a unified view to query recent activity across all modules
-- Run this on existing databases to add the view without re-running entire schema

-- Create activity_feed view
CREATE OR REPLACE VIEW activity_feed AS
SELECT 
    'loan_created' as event_type,
    l.id::text as event_id,
    l.borrower_name as entity_name,
    'Loan Created: ' || l.borrower_name as description,
    l.loan_type as metadata,
    l.created_at as event_timestamp,
    l.user_id
FROM loans l

UNION ALL

SELECT 
    'filing_submitted' as event_type,
    f.id::text as event_id,
    f.entity_name,
    'Filing Submitted: ' || COALESCE(f.charge_type, 'CAC Filing') as description,
    f.status as metadata,
    COALESCE(f.submission_date, f.created_at) as event_timestamp,
    f.user_id
FROM filings f

UNION ALL

SELECT 
    'document_generated' as event_type,
    d.id::text as event_id,
    COALESCE(d.title, 'Untitled Document') as entity_name,
    'Document Generated: ' || COALESCE(d.name, d.title, 'Untitled') as description,
    d.template_type as metadata,
    d.created_at as event_timestamp,
    d.user_id
FROM documents d

UNION ALL

SELECT 
    'kyc_completed' as event_type,
    k.id::text as event_id,
    k.entity_name,
    'KYC Completed: ' || k.entity_name as description,
    k.status as metadata,
    k.updated_at as event_timestamp,
    k.user_id
FROM kyc_requests k
WHERE k.status = 'Approved'

ORDER BY event_timestamp DESC;

-- Grant access to authenticated users
GRANT SELECT ON activity_feed TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW activity_feed IS 'Unified activity feed showing recent events across loans, filings, documents, and KYC requests. Used by Dashboard component.';

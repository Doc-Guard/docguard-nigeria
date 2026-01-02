import { supabase } from '../lib/supabase';

export interface VerificationRecord {
    verificationType: 'BVN' | 'CAC_RC' | 'FIRS_TIN' | 'DOCUMENT' | 'LIVENESS';
    entityName: string;
    identifier: string; // The actual BVN/RC/TIN value
    status: 'Verified' | 'Failed' | 'Pending';
    details: Record<string, any>;
    riskScore?: number;
    loanId?: string;
}

/**
 * Check if an identifier (BVN, RC, TIN) has already been verified
 */
export const checkExistingVerification = async (
    verificationType: string,
    identifier: string
): Promise<{ exists: boolean; record?: any }> => {
    const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('verification_type', verificationType)
        .eq('identifier', identifier)
        .eq('status', 'Verified')
        .maybeSingle();

    if (error) {
        console.error('Error checking existing verification:', error);
        return { exists: false };
    }

    return { exists: !!data, record: data };
};

/**
 * Save a new verification record to the database
 */
export const saveVerification = async (record: VerificationRecord): Promise<{ success: boolean; error?: string; data?: any }> => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // Check if this identifier was already verified (uniqueness check)
    const existing = await checkExistingVerification(record.verificationType, record.identifier);
    if (existing.exists) {
        return {
            success: false,
            error: `This ${record.verificationType} has already been verified for ${existing.record?.entity_name}. Each identifier can only be registered once.`
        };
    }

    // Insert new verification record
    const { data, error } = await supabase
        .from('kyc_requests')
        .insert({
            user_id: user.id,
            loan_id: record.loanId || null,
            entity_name: record.entityName,
            verification_type: record.verificationType,
            identifier: record.identifier,
            status: record.status,
            risk_score: record.riskScore,
            details: record.details
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving verification:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
};

/**
 * Get all verifications for a specific loan
 */
export const getVerificationsForLoan = async (loanId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('loan_id', loanId)
        .eq('status', 'Verified')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching verifications:', error);
        return [];
    }

    return data || [];
};

/**
 * Get all verifications for current user
 */
export const getUserVerifications = async (): Promise<any[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Verified')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user verifications:', error);
        return [];
    }

    return data || [];
};

/**
 * Check if entity is already verified by any identifier
 */
export const isEntityVerified = async (identifier: string): Promise<boolean> => {
    const { data } = await supabase
        .from('kyc_requests')
        .select('id')
        .eq('identifier', identifier)
        .eq('status', 'Verified')
        .maybeSingle();

    return !!data;
};

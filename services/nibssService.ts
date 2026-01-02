
// NIBSS API Simulation
export interface BVNRecord {
    bvn: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    dob: string;
    phone: string;
    base64Image?: string; // Facial image from BVN database
    gender: 'Male' | 'Female';
    status: 'VERIFIED' | 'NOT_FOUND';
}

export interface BVNValidationContext {
    entityName?: string; // Name from linked loan (e.g., borrower_name)
}

class NIBSSService {
    private static instance: NIBSSService;

    private constructor() { }

    public static getInstance(): NIBSSService {
        if (!NIBSSService.instance) {
            NIBSSService.instance = new NIBSSService();
        }
        return NIBSSService.instance;
    }

    /**
     * Validates a Bank Verification Number
     * NOTE: This is a simulation. In production, integrate with real NIBSS API.
     * @param bvn - The 11-digit BVN to validate
     * @param context - Optional context containing entity information from linked loan
     */
    public async validateBVN(bvn: string, context?: BVNValidationContext): Promise<BVNRecord> {
        // Simulate API latency
        await new Promise(r => setTimeout(r, 1500));

        if (!/^\d{11}$/.test(bvn)) {
            throw new Error("Invalid BVN Format - must be 11 digits");
        }

        // In production, this would call the actual NIBSS API
        // For simulation, we accept any valid format and return the entity context name
        const nameParts = (context?.entityName || 'Verified Individual').split(' ');
        const firstName = nameParts[0] || 'Verified';
        const lastName = nameParts.slice(1).join(' ') || 'Individual';

        return {
            bvn,
            firstName,
            lastName,
            dob: "1990-01-01", // Simulated - real API would return actual DOB
            phone: "08000000000", // Simulated
            gender: 'Male',
            status: 'VERIFIED'
        };
    }
}

export const nibssService = NIBSSService.getInstance();

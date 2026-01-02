
// FIRS API Simulation
export interface TaxEntity {
    tin: string;
    taxpayerName: string;
    taxOffice: string;
    activeStatus: 'Active' | 'Inactive';
    email: string;
}

export interface FIRSValidationContext {
    entityName?: string; // Company name from linked loan
}

class FIRSService {
    private static instance: FIRSService;

    private constructor() { }

    public static getInstance(): FIRSService {
        if (!FIRSService.instance) {
            FIRSService.instance = new FIRSService();
        }
        return FIRSService.instance;
    }

    /**
     * Validates a Tax Identification Number (TIN - Corporate or Individual)
     * NOTE: This is a simulation. In production, integrate with real FIRS API.
     * @param tin - The TIN to validate (10-12 digits)
     * @param context - Optional context containing entity information from linked loan
     */
    public async validateTIN(tin: string, context?: FIRSValidationContext): Promise<TaxEntity> {
        // Simulate API latency
        await new Promise(r => setTimeout(r, 1200));

        // Validate TIN format
        if (!/^\d{10,12}$/.test(tin)) {
            throw new Error("Invalid TIN format. Must be 10-12 digits.");
        }

        // In production, this would call the actual FIRS API
        // For simulation, we accept any valid format and return the entity context name
        const taxpayerName = context?.entityName || `Taxpayer ${tin}`;

        return {
            tin,
            taxpayerName: taxpayerName.toUpperCase(),
            taxOffice: "MSTO LAGOS", // Simulated
            activeStatus: "Active",
            email: "tax@entity.ng" // Simulated
        };
    }
}

export const firsService = FIRSService.getInstance();

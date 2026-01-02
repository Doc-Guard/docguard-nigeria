
// CAC Public Search Simulation
export interface CompanyProfile {
    rcNumber: string;
    companyName: string;
    companyType: 'Private Limited' | 'Public Limited' | 'Business Name';
    registrationDate: string;
    address: string;
    directors: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'DELISTED';
    shareCapital: number;
}

export interface CACSearchContext {
    entityName?: string; // Company name from linked loan (e.g., borrower_name)
}

class CACService {
    private static instance: CACService;

    private constructor() { }

    public static getInstance(): CACService {
        if (!CACService.instance) {
            CACService.instance = new CACService();
        }
        return CACService.instance;
    }

    /**
     * Searches for a registered entity by RC Number
     * NOTE: This is a simulation. In production, integrate with real CAC API.
     * @param rcNumber - The RC Number to search
     * @param context - Optional context containing entity information from linked loan
     */
    public async searchCompany(rcNumber: string, context?: CACSearchContext): Promise<CompanyProfile> {
        // Simulate API latency
        await new Promise(r => setTimeout(r, 2000));

        // Validate RC Number format
        if (!/^RC\d+$/i.test(rcNumber)) {
            throw new Error("Invalid RC Number format. Must start with 'RC' followed by digits.");
        }

        // In production, this would call the actual CAC API
        // For simulation, we accept any valid format and return the entity context name
        const companyName = context?.entityName || `Company ${rcNumber.toUpperCase()}`;

        return {
            rcNumber: rcNumber.toUpperCase(),
            companyName: companyName.toUpperCase(),
            companyType: "Private Limited",
            registrationDate: "2020-01-01", // Simulated
            address: "Lagos, Nigeria", // Simulated
            directors: ["Director 1", "Director 2"], // Simulated
            status: "ACTIVE",
            shareCapital: 10000000 // Simulated
        };
    }
}

export const cacService = CACService.getInstance();

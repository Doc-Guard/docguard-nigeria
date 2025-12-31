
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
     * Searches for a registered entity by RC Number or Name
     */
    public async searchCompany(query: string): Promise<CompanyProfile> {
        // Simulate API latency
        await new Promise(r => setTimeout(r, 2000));

        // Mock Data
        if (query.includes('RC100023') || query.toUpperCase().includes('DANGOTE')) {
            return {
                rcNumber: "RC100023",
                companyName: "DANGOTE INDUSTRIES LIMITED",
                companyType: "Public Limited",
                registrationDate: "1981-05-14",
                address: "1 Alfred Rewane Road, Ikoyi, Lagos",
                directors: ["Aliko Dangote", "Olakunle Alake", "Sani Dangote"],
                status: "ACTIVE",
                shareCapital: 500000000
            };
        }

        if (query.includes('RC12345') || query.toUpperCase().includes('LMA')) {
            return {
                rcNumber: "RC12345",
                companyName: "LMA NIGERIA DEMO LTD",
                companyType: "Private Limited",
                registrationDate: "2024-01-15",
                address: "12 Ozumba Mbadiwe, Victoria Island, Lagos",
                directors: ["John Doe", "Jane Smith"],
                status: "ACTIVE",
                shareCapital: 10000000
            };
        }

        // Allow any valid RC Number format for Demo/Testing user input (e.g., RC123456)
        // User Request: "prove loan originator to include entries... on each step... prefilled"
        // This ensures the prefilled data is accepted as valid.
        if (/^RC\d+$/i.test(query)) {
            return {
                rcNumber: query.toUpperCase(),
                companyName: "DEMO PRE-FILLED ENTITY PLC",
                companyType: "Public Limited",
                registrationDate: "2000-01-01",
                address: "100 Broad Street, Marina, Lagos",
                directors: ["Demo Director 1", "Demo Director 2"],
                status: "ACTIVE",
                shareCapital: 1000000000
            };
        }

        throw new Error("Company Record Not Found");
    }
}

export const cacService = CACService.getInstance();

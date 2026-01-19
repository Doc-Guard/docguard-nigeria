
import { supabase } from '../lib/supabase';

// NCR API Types (Simulated based on STMA 2017)
export interface NCRAsset {
    type: 'Equipment' | 'Inventory' | 'Receivables' | 'Intellectual_Property' | 'Motor_Vehicle';
    description: string;
    serialNumber?: string; // For equipment/vehicles
    value: number;
    currency: string;
    location: string;
}

export interface NCRRegistrationPayload {
    borrowerId: string; // Linking to our internal Borrower ID
    borrowerName: string;
    borrowerTIN: string; // Tax ID
    collateral: NCRAsset[];
    securedAmount: number;
    currency: string;
    expiryDate: string; // STMA registrations expire
}

export interface NCRRegistrationResponse {
    registrationId: string;
    status: 'Registered' | 'Pending' | 'Failed';
    timestamp: string;
    ncrCertificateUrl?: string; // Mock URL
}

export interface NCRSearchResult {
    registrationId: string;
    borrowerName: string;
    collateralType: string;
    description: string;
    securedAmount: string;
    registrationDate: string;
    status: 'Active' | 'Discharged';
}

class NCRService {
    private static instance: NCRService;
    private endpoint = "https://sandbox.ncr.gov.ng/api/v1"; // Mock Endpoint

    private constructor() { }

    public static getInstance(): NCRService {
        if (!NCRService.instance) {
            NCRService.instance = new NCRService();
        }
        return NCRService.instance;
    }

    /**
     * Simulates a search on the National Collateral Registry
     * Used for pre-loan due diligence (Section 3 Stma 2017)
     */
    public async searchCollateral(query: string): Promise<NCRSearchResult[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock results - in production this would hit the NCR API
        if (query.toLowerCase().includes('dangote')) {
            return [
                {
                    registrationId: "NCR-2023-99812",
                    borrowerName: "Dangote Industries Ltd",
                    collateralType: "Equipment",
                    description: "Caterpillar Excavators (CAT-320D) x 10",
                    securedAmount: "NGN 500,000,000",
                    registrationDate: "2023-05-12",
                    status: "Active"
                }
            ];
        }

        return [];
    }

    /**
     * Registers a Security Interest in Movable Assets
     * Compliance: STMA 2017 Section 8
     */
    public async registerSecurityInterest(payload: NCRRegistrationPayload): Promise<NCRRegistrationResponse> {
        console.log("Initiating NCR Registration for:", payload.borrowerName);

        // Simulate validation
        if (!payload.borrowerTIN) {
            throw new Error("NCR Error: Borrower TIN is required for registration validation.");
        }

        // Simulate network delay for "Connecting to NCR Gateway..."
        await new Promise(resolve => setTimeout(resolve, 2500));

        const registrationId = `NCR-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;

        // In a real app, we would save this "Perfection" status to our database
        // interacting with the specific Loan record

        return {
            registrationId,
            status: 'Registered',
            timestamp: new Date().toISOString(),
            ncrCertificateUrl: `https://ncr.gov.ng/certs/${registrationId}.pdf`
        };
    }
}

export const ncrService = NCRService.getInstance();

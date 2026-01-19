/**
 * LMA (Loan Market Association) Template Library
 * Adapted for Nigerian Jurisdiction
 * 
 * Based on:
 * - LMA Africa Term SOFR Facility Agreement
 * - Companies and Allied Matters Act (CAMA) 2020
 * - Secured Transactions in Movable Assets Act (STMA) 2017
 * - CBN Prudential Guidelines
 * - BOFIA 2020
 */

export interface LMAClause {
    id: string;
    name: string;
    content: string;
    category: 'standard' | 'nigerian_adapted';
    legalReference?: string;
}

export interface LMASection {
    id: string;
    name: string;
    description: string;
    icon: string;
    clauses: LMAClause[];
}

export interface LMATemplate {
    id: string;
    name: string;
    description: string;
    sections: LMASection[];
}

// ============================================
// LMA SECTIONS WITH NIGERIAN ADAPTATIONS
// ============================================

const DEFINITIONS_SECTION: LMASection = {
    id: 'definitions',
    name: 'Definitions & Interpretation',
    description: 'Key terms and interpretation rules',
    icon: 'BookOpen',
    clauses: [
        {
            id: 'def-1',
            name: 'Standard Definitions',
            category: 'standard',
            content: `In this Agreement:

"Agent" means [●] acting as agent for the Finance Parties.
"Availability Period" means the period from and including the date of this Agreement to and including the date falling [●] months after the date of this Agreement.
"Business Day" means a day (other than a Saturday, Sunday, or public holiday) on which banks are open for general business in Lagos, Nigeria.
"Commitment" means, in relation to each Lender, the amount set opposite its name under the heading "Commitment" in Schedule 1 (The Original Parties).
"Facility" means the term loan facility made available under this Agreement.
"Finance Documents" means this Agreement, any Security Document, and any other document designated as such by the Agent and the Borrower.`
        },
        {
            id: 'def-2',
            name: 'Nigerian Regulatory Definitions',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020, BOFIA 2020',
            content: `"CAC" means the Corporate Affairs Commission of Nigeria established under the Companies and Allied Matters Act 2020.
"CBN" means the Central Bank of Nigeria established under the Central Bank of Nigeria Act 2007.
"NCR" means the National Collateral Registry established under the Secured Transactions in Movable Assets Act 2017.
"NIBSS" means the Nigeria Inter-Bank Settlement System Plc.
"BVN" means Bank Verification Number as required by CBN regulations.
"TIN" means Tax Identification Number issued by the Federal Inland Revenue Service.
"NAICOM" means the National Insurance Commission of Nigeria.`
        }
    ]
};

const CONDITIONS_PRECEDENT_SECTION: LMASection = {
    id: 'conditions-precedent',
    name: 'Conditions Precedent',
    description: 'Requirements before drawdown',
    icon: 'CheckSquare',
    clauses: [
        {
            id: 'cp-1',
            name: 'Documentary Conditions',
            category: 'standard',
            content: `The Lender shall not be obliged to fund any Utilisation unless it has received all of the following documents in form and substance satisfactory to it:

(a) a certified copy of the constitutional documents of the Borrower;
(b) a certified copy of a resolution of the board of directors of the Borrower approving the terms of, and the transactions contemplated by, the Finance Documents;
(c) a specimen of the signature of each person authorised to execute the Finance Documents on behalf of the Borrower;
(d) a certificate of an authorised signatory of the Borrower certifying that the copy documents referred to above are correct, complete, and in full force and effect.`
        },
        {
            id: 'cp-2',
            name: 'Nigerian Regulatory Conditions',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020 §119-120, CBN Circulars',
            content: `Prior to the first Utilisation, the Borrower shall deliver to the Agent:

(a) certified true copies of the Borrower's Certificate of Incorporation and Certificate of Compliance issued by the CAC;
(b) evidence of the Borrower's current standing with the CAC, being a Status Report not more than 30 days old;
(c) particulars of all persons with significant control over the Borrower as required by Sections 119 and 120 of CAMA 2020;
(d) valid Bank Verification Numbers (BVN) for all directors and signatories;
(e) the Borrower's Tax Identification Number (TIN) and evidence of tax clearance for the preceding three years;
(f) evidence of compliance with all applicable CBN capital requirements (where the Borrower is a regulated entity).`
        }
    ]
};

const REPRESENTATIONS_SECTION: LMASection = {
    id: 'representations',
    name: 'Representations & Warranties',
    description: 'Borrower statements of fact',
    icon: 'FileCheck',
    clauses: [
        {
            id: 'rep-1',
            name: 'Status and Capacity',
            category: 'standard',
            content: `The Borrower represents and warrants to each Finance Party that:

(a) it is a limited liability company, duly incorporated and validly existing under the laws of Nigeria;
(b) it has the power to own its assets and carry on its business as it is being conducted;
(c) it has the power to enter into, perform, and deliver, and has taken all necessary action to authorise its entry into, performance, and delivery of, the Finance Documents and the transactions contemplated by them.`
        },
        {
            id: 'rep-2',
            name: 'Nigerian Corporate Compliance',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020 §27, §183',
            content: `The Borrower represents and warrants that:

(a) it has duly complied with the requirements of Section 27 of CAMA 2020 regarding issued share capital;
(b) no financial assistance within the meaning of Section 183 of CAMA 2020 has been given by the Borrower for the purpose of this transaction, or if given, has been provided in compliance with Section 184;
(c) all particulars of persons with significant control have been filed with the CAC as required by Sections 119 and 120 of CAMA 2020;
(d) the net assets of the Borrower (as defined in Section 183(4) of CAMA 2020) are not less than the aggregate of its called-up share capital and undistributable reserves.`
        },
        {
            id: 'rep-3',
            name: 'BVN/TIN Verification',
            category: 'nigerian_adapted',
            legalReference: 'CBN Circulars, FIRS Regulations',
            content: `The Borrower represents and warrants that:

(a) the Bank Verification Numbers (BVN) of its directors and authorised signatories provided to the Lender are valid, active, and correctly registered with NIBSS;
(b) its Tax Identification Number (TIN) provided to the Lender is valid and correctly registered with the Federal Inland Revenue Service;
(c) it has obtained all necessary tax clearance certificates and is not in default of any material tax obligations.`
        },
        {
            id: 'rep-4',
            name: 'No Insolvency',
            category: 'standard',
            content: `The Borrower represents and warrants that:

(a) no Insolvency Proceedings have been commenced or threatened against it;
(b) no moratorium has been declared or is in effect in respect of any of its indebtedness;
(c) it is able to pay its debts as they fall due and the value of its assets exceeds its liabilities.`
        }
    ]
};

const UNDERTAKINGS_SECTION: LMASection = {
    id: 'undertakings',
    name: 'Undertakings',
    description: 'Borrower ongoing obligations',
    icon: 'Shield',
    clauses: [
        {
            id: 'und-1',
            name: 'Information Undertakings',
            category: 'standard',
            content: `The Borrower undertakes to supply to the Agent:

(a) as soon as they are available, but in any event within 180 days after the end of each of its financial years, its audited financial statements for that financial year;
(b) as soon as they are available, but in any event within 90 days after the end of each half of its financial years, its unaudited financial statements for that half year;
(c) promptly upon becoming aware of them, details of any litigation, arbitration, or administrative proceedings which are current, threatened, or pending against any member of the Group.`
        },
        {
            id: 'und-2',
            name: 'Charge Perfection (CAMA 2020)',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020 §222',
            content: `The Borrower shall within 90 days from the date of creation of any charge or security interest created by this Agreement, deliver to the Agent evidence of registration of such charge with the Corporate Affairs Commission in accordance with Section 222 of the Companies and Allied Matters Act 2020.`
        },
        {
            id: 'und-3',
            name: 'Movable Assets Security (STMA 2017)',
            category: 'nigerian_adapted',
            legalReference: 'STMA 2017',
            content: `The Security Interest created under this Agreement in respect of movable assets shall be perfected by:

(a) the registration of a financing statement at the National Collateral Registry in accordance with the Secured Transactions in Movable Assets Act 2017;
(b) delivery to the Agent, within 14 days of such registration, of the NCR Search Report and Collateral ID confirming the registration;
(c) the Borrower maintaining the registration in full force and effect throughout the term of this Agreement.`
        },
        {
            id: 'und-4',
            name: 'Insurance of Secured Assets',
            category: 'nigerian_adapted',
            legalReference: 'Insurance Act 2003, NAICOM Guidelines',
            content: `The Borrower shall:

(a) within 7 days of the execution of this Agreement, deliver to the Agent evidence of comprehensive insurance coverage for all Secured Assets;
(b) ensure such insurance is issued by NAICOM-approved underwriters acceptable to the Agent (specifically Leadway Assurance, AIICO Insurance, AXA Mansard, or Custodian Insurance);
(c) name the Security Agent as first loss payee on all such policies;
(d) promptly notify the Agent of any claims, incidents, or material changes to coverage.`
        },
        {
            id: 'und-5',
            name: 'Anti-Bribery and Corruption',
            category: 'nigerian_adapted',
            legalReference: 'ICPC Act, EFCC Act',
            content: `The Borrower undertakes that:

(a) it shall comply with all applicable Nigerian anti-corruption laws, including the Corrupt Practices and Other Related Offences Act 2000 and the Economic and Financial Crimes Commission (Establishment) Act 2004;
(b) it shall not, and shall procure that no person acting on its behalf shall, directly or indirectly, offer, pay, promise to pay, or authorise the payment of any money or anything of value to any public official or private party for the purpose of improperly obtaining or retaining business;
(c) it has and shall maintain adequate procedures designed to prevent any breach of this clause.`
        },
        {
            id: 'und-6',
            name: 'Negative Pledge',
            category: 'standard',
            content: `The Borrower shall not create or permit to subsist any Security over any of its assets other than Permitted Security.

"Permitted Security" means:
(a) Security existing as at the date of this Agreement and disclosed to the Lender;
(b) any lien arising by operation of law in the ordinary course of business;
(c) Security created with the prior written consent of the Agent.`
        }
    ]
};

const EVENTS_OF_DEFAULT_SECTION: LMASection = {
    id: 'events-of-default',
    name: 'Events of Default',
    description: 'Trigger events for acceleration',
    icon: 'AlertTriangle',
    clauses: [
        {
            id: 'eod-1',
            name: 'Non-Payment',
            category: 'standard',
            content: `An Event of Default occurs if the Borrower fails to pay any amount due under a Finance Document at the time, in the currency, and in the manner specified in such Finance Document, unless payment is made within 3 Business Days of its due date.`
        },
        {
            id: 'eod-2',
            name: 'Breach of Undertakings',
            category: 'standard',
            content: `An Event of Default occurs if the Borrower fails to comply with:

(a) any provision of Clause [●] (Information Undertakings); or
(b) any other provision of the Finance Documents (other than those referred to above),

and (in the case of a breach of paragraph (b)) such failure is not remedied within 30 days of the earlier of the Agent giving notice or the Borrower becoming aware of the failure.`
        },
        {
            id: 'eod-3',
            name: 'Misrepresentation',
            category: 'standard',
            content: `An Event of Default occurs if any representation or warranty made or deemed to be made by the Borrower in the Finance Documents or any other document delivered under or in connection with any Finance Document is or proves to have been incorrect or misleading in any material respect when made or deemed to be made.`
        },
        {
            id: 'eod-4',
            name: 'Insolvency (Nigerian Law)',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020 §718-721, Bankruptcy Act',
            content: `An Event of Default occurs if:

(a) the Borrower is or is deemed for the purposes of any applicable law to be unable to pay its debts as they fall due;
(b) any insolvency proceedings are commenced against the Borrower, including any petition for winding up, administration, or bankruptcy under CAMA 2020 or the Bankruptcy Act;
(c) a moratorium is declared in respect of any indebtedness of the Borrower;
(d) any netting agreement to which the Borrower is a party becomes enforceable against it under Sections 718-721 of CAMA 2020.`
        },
        {
            id: 'eod-5',
            name: 'Material Adverse Change',
            category: 'standard',
            content: `An Event of Default occurs if any event or circumstance occurs which, in the reasonable opinion of the Majority Lenders, has or is reasonably likely to have a Material Adverse Effect.

"Material Adverse Effect" means a material adverse effect on:
(a) the business, operations, property, condition (financial or otherwise), or prospects of the Borrower;
(b) the ability of the Borrower to perform its obligations under the Finance Documents; or
(c) the validity or enforceability of, or the effectiveness or ranking of any Security granted or purporting to be granted pursuant to, any Finance Document.`
        },
        {
            id: 'eod-6',
            name: 'Regulatory Non-Compliance',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020, CBN Regulations',
            content: `An Event of Default occurs if:

(a) the Borrower fails to maintain its registration with the CAC in good standing;
(b) the Borrower's certificate of incorporation or any business permit or licence is revoked, suspended, or materially restricted;
(c) the Borrower fails to comply with any material requirement of the CBN, SEC, or other applicable regulatory authority;
(d) any Security granted under the Finance Documents fails to be perfected or registered as required by applicable Nigerian law.`
        }
    ]
};

const SECURITY_SECTION: LMASection = {
    id: 'security',
    name: 'Security',
    description: 'Collateral and security arrangements',
    icon: 'Lock',
    clauses: [
        {
            id: 'sec-1',
            name: 'Grant of Security',
            category: 'standard',
            content: `As continuing security for the payment or discharge of all Secured Obligations, the Borrower with full title guarantee hereby:

(a) assigns absolutely to the Security Agent all its right, title, and interest in and to the Assigned Contracts;
(b) charges by way of first fixed charge all its right, title, and interest in and to the Charged Shares and the Charged Accounts;
(c) charges by way of first floating charge all its undertaking and all its property, assets, and rights whatsoever and wheresoever, both present and future, not otherwise effectively charged or assigned by way of fixed charge or assigned absolutely.`
        },
        {
            id: 'sec-2',
            name: 'Nigerian Fixed and Floating Charge',
            category: 'nigerian_adapted',
            legalReference: 'CAMA 2020 §178-222',
            content: `The charge created hereby shall:

(a) in respect of fixed assets, constitute a fixed charge enforceable in accordance with Part XII of CAMA 2020;
(b) in respect of the undertaking and circulating assets, constitute a floating charge which shall crystallise in accordance with the terms hereof and applicable Nigerian law;
(c) be registered with the CAC within 90 days of creation as required by Section 222 of CAMA 2020;
(d) take priority in accordance with the date and time of registration at the CAC.`
        },
        {
            id: 'sec-3',
            name: 'NCR Registration (STMA 2017)',
            category: 'nigerian_adapted',
            legalReference: 'STMA 2017 §8-15',
            content: `In respect of all movable collateral:

(a) the Security Interest shall be perfected by filing a financing statement with the National Collateral Registry (NCR) in accordance with Section 8 of the STMA 2017;
(b) the financing statement shall contain all particulars required by Section 9 of the STMA 2017;
(c) the priority of the Security Interest shall be determined by the order of registration at the NCR as provided in Sections 27-32 of the STMA 2017;
(d) upon full repayment of the Secured Obligations, the Secured Party shall file a termination statement with the NCR.`
        },
        {
            id: 'sec-4',
            name: 'Sovereign Immunity Waiver',
            category: 'nigerian_adapted',
            legalReference: 'State Immunity',
            content: `To the extent that the Borrower may in any jurisdiction claim for itself or its assets immunity from suit, execution, attachment, or other legal process, the Borrower irrevocably and unconditionally waives, to the fullest extent permitted by Nigerian law, any right of immunity which it or any of its assets now has or may in the future have in any jurisdiction from any legal action, suit, or proceeding, from setoff or counterclaim, and from the jurisdiction of any court or arbitral tribunal.`
        }
    ]
};

const BOILERPLATE_SECTION: LMASection = {
    id: 'boilerplate',
    name: 'Boilerplate',
    description: 'Standard administrative provisions',
    icon: 'FileText',
    clauses: [
        {
            id: 'bp-1',
            name: 'Notices',
            category: 'standard',
            content: `Any communication to be made under or in connection with the Finance Documents shall be made in writing and, unless otherwise stated, may be made by letter or email.

All notices shall be sent to the addresses or email addresses specified in Schedule [●] (Addresses for Notices) or such other address or email address as may be notified in writing from time to time.`
        },
        {
            id: 'bp-2',
            name: 'Governing Law and Jurisdiction (Nigeria)',
            category: 'nigerian_adapted',
            legalReference: 'Constitution of Nigeria, Arbitration Act',
            content: `This Agreement and any non-contractual obligations arising out of or in connection with it shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.

The courts of Nigeria shall have exclusive jurisdiction to settle any dispute arising out of or in connection with this Agreement. For the avoidance of doubt, this clause is for the benefit of the Finance Parties only. To the extent allowed by law, a Finance Party may take proceedings in any other court with jurisdiction.`
        },
        {
            id: 'bp-3',
            name: 'Arbitration (Lagos)',
            category: 'nigerian_adapted',
            legalReference: 'Arbitration and Mediation Act 2023',
            content: `Any dispute arising out of or in connection with this Agreement, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration under the Rules of the Lagos Court of Arbitration, which Rules are deemed to be incorporated by reference into this clause.

The number of arbitrators shall be three. The seat, or legal place, of arbitration shall be Lagos, Nigeria. The language to be used in the arbitral proceedings shall be English.`
        },
        {
            id: 'bp-4',
            name: 'Stamps and Taxes',
            category: 'nigerian_adapted',
            legalReference: 'Stamp Duties Act',
            content: `The Borrower shall pay and indemnify each Finance Party against any cost, loss, or liability which that Finance Party incurs in relation to all stamp duty, registration, and other similar Taxes payable in respect of any Finance Document.

Without limitation, the Borrower shall procure that all Finance Documents are duly stamped with the Federal Inland Revenue Service or relevant State authority within 40 days of execution.`
        }
    ]
};

// ============================================
// COMPLETE TEMPLATES
// ============================================

export const LMA_SECURED_TERM_FACILITY: LMATemplate = {
    id: 'lma-secured-term',
    name: 'LMA Nigeria 2024 - Secured Term Facility',
    description: 'Standard secured term loan facility adapted for Nigerian jurisdiction with CAMA 2020 and STMA 2017 compliance.',
    sections: [
        DEFINITIONS_SECTION,
        CONDITIONS_PRECEDENT_SECTION,
        REPRESENTATIONS_SECTION,
        UNDERTAKINGS_SECTION,
        EVENTS_OF_DEFAULT_SECTION,
        SECURITY_SECTION,
        BOILERPLATE_SECTION
    ]
};

export const LMA_SYNDICATED_FACILITY: LMATemplate = {
    id: 'lma-syndicated',
    name: 'LMA Nigeria 2024 - Syndicated Multicurrency',
    description: 'Syndicated loan facility for multiple lenders with multicurrency options.',
    sections: [
        DEFINITIONS_SECTION,
        CONDITIONS_PRECEDENT_SECTION,
        REPRESENTATIONS_SECTION,
        UNDERTAKINGS_SECTION,
        EVENTS_OF_DEFAULT_SECTION,
        SECURITY_SECTION,
        BOILERPLATE_SECTION
    ]
};

export const CBN_SME_TEMPLATE: LMATemplate = {
    id: 'cbn-sme',
    name: 'CBN Prudential SME Template',
    description: 'Template aligned with CBN SME lending guidelines and intervention fund requirements.',
    sections: [
        DEFINITIONS_SECTION,
        CONDITIONS_PRECEDENT_SECTION,
        REPRESENTATIONS_SECTION,
        UNDERTAKINGS_SECTION,
        EVENTS_OF_DEFAULT_SECTION,
        BOILERPLATE_SECTION
    ]
};

export const CONSUMER_FINANCE_TEMPLATE: LMATemplate = {
    id: 'fccpc-consumer',
    name: 'FCCPC 2025 Consumer Finance',
    description: 'Consumer lending template compliant with FCCPC and CBN consumer protection regulations.',
    sections: [
        DEFINITIONS_SECTION,
        REPRESENTATIONS_SECTION,
        UNDERTAKINGS_SECTION,
        EVENTS_OF_DEFAULT_SECTION,
        BOILERPLATE_SECTION
    ]
};

// Export all templates
export const LMA_TEMPLATES: LMATemplate[] = [
    LMA_SECURED_TERM_FACILITY,
    LMA_SYNDICATED_FACILITY,
    CBN_SME_TEMPLATE,
    CONSUMER_FINANCE_TEMPLATE
];

// Helper to get template by ID
export const getTemplateById = (id: string): LMATemplate | undefined => {
    return LMA_TEMPLATES.find(t => t.id === id);
};

// Helper to get all clauses from a template
export const getAllClauses = (template: LMATemplate): LMAClause[] => {
    return template.sections.flatMap(s => s.clauses);
};

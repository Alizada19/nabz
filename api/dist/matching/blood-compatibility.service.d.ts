export declare class BloodCompatibilityService {
    private static readonly COMPATIBILITY_MAP;
    private static readonly VALID_TYPES;
    getCompatibleDonorTypes(requiredBloodType: string): string[];
    isCompatible(donorType: string, requiredBloodType: string): boolean;
    getAllValidBloodTypes(): string[];
    isValidBloodType(bloodType: string): boolean;
    private normalize;
}

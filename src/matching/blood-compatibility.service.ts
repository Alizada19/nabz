import { Injectable } from '@nestjs/common';

/**
 * BloodCompatibilityService
 *
 * Encodes universal blood-donation compatibility rules using a reusable
 * lookup map: for a given RECIPIENT blood type, which DONOR blood types
 * are compatible.
 *
 * Rules (recipient -> compatible donors):
 *  O-   -> O-
 *  O+   -> O+, O-
 *  A-   -> A-, O-
 *  A+   -> A+, A-, O+, O-
 *  B-   -> B-, O-
 *  B+   -> B+, B-, O+, O-
 *  AB-  -> AB-, A-, B-, O-
 *  AB+  -> AB+, AB-, A+, A-, B+, B-, O+, O-  (universal recipient)
 */
@Injectable()
export class BloodCompatibilityService {
  private static readonly COMPATIBILITY_MAP: Readonly<
    Record<string, readonly string[]>
  > = Object.freeze({
    'O-': ['O-'],
    'O+': ['O+', 'O-'],
    'A-': ['A-', 'O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
  });

  private static readonly VALID_TYPES = Object.keys(
    BloodCompatibilityService.COMPATIBILITY_MAP,
  );

  /**
   * Given a blood type REQUIRED by a recipient/seeker, returns the list of
   * donor blood types that are compatible donors for that requirement.
   *
   * Example: getCompatibleDonorTypes('O+') -> ['O+', 'O-']
   */
  getCompatibleDonorTypes(requiredBloodType: string): string[] {
    const normalized = this.normalize(requiredBloodType);
    const compatible = BloodCompatibilityService.COMPATIBILITY_MAP[normalized];
    if (!compatible) {
      throw new Error(`Unknown blood type: ${requiredBloodType}`);
    }
    return [...compatible];
  }

  /**
   * Returns true if `donorType` can safely donate to a recipient who requires
   * `requiredBloodType`.
   */
  isCompatible(donorType: string, requiredBloodType: string): boolean {
    return this.getCompatibleDonorTypes(requiredBloodType).includes(
      this.normalize(donorType),
    );
  }

  getAllValidBloodTypes(): string[] {
    return [...BloodCompatibilityService.VALID_TYPES];
  }

  isValidBloodType(bloodType: string): boolean {
    return BloodCompatibilityService.VALID_TYPES.includes(
      this.normalize(bloodType),
    );
  }

  private normalize(bloodType: string): string {
    return bloodType?.trim().toUpperCase();
  }
}

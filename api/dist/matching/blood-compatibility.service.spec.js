"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blood_compatibility_service_1 = require("./blood-compatibility.service");
describe('BloodCompatibilityService', () => {
    let service;
    beforeEach(() => {
        service = new blood_compatibility_service_1.BloodCompatibilityService();
    });
    it('O- can only receive from O-', () => {
        expect(service.getCompatibleDonorTypes('O-')).toEqual(['O-']);
    });
    it('O+ can receive from O+ and O-', () => {
        expect(service.getCompatibleDonorTypes('O+').sort()).toEqual(['O+', 'O-'].sort());
    });
    it('AB+ is the universal recipient (accepts all types)', () => {
        const result = service.getCompatibleDonorTypes('AB+');
        expect(result.sort()).toEqual(['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'].sort());
    });
    it('A+ can receive from A+, A-, O+, O-', () => {
        expect(service.getCompatibleDonorTypes('A+').sort()).toEqual(['A+', 'A-', 'O+', 'O-'].sort());
    });
    it('B- can receive from B- and O- only', () => {
        expect(service.getCompatibleDonorTypes('B-').sort()).toEqual(['B-', 'O-'].sort());
    });
    it('AB- can receive from AB-, A-, B-, O-', () => {
        expect(service.getCompatibleDonorTypes('AB-').sort()).toEqual(['AB-', 'A-', 'B-', 'O-'].sort());
    });
    it('isCompatible correctly evaluates donor -> recipient pairs', () => {
        expect(service.isCompatible('O-', 'AB+')).toBe(true);
        expect(service.isCompatible('AB+', 'O-')).toBe(false);
        expect(service.isCompatible('A+', 'A+')).toBe(true);
    });
    it('normalizes case and whitespace', () => {
        expect(service.getCompatibleDonorTypes(' o+ ')).toEqual(expect.arrayContaining(['O+', 'O-']));
    });
    it('throws on an unknown blood type', () => {
        expect(() => service.getCompatibleDonorTypes('X+')).toThrow();
    });
    it('lists all 8 valid blood types', () => {
        expect(service.getAllValidBloodTypes().sort()).toEqual(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].sort());
    });
});
//# sourceMappingURL=blood-compatibility.service.spec.js.map
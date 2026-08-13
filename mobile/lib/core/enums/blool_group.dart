enum BloodGroup {
  aPositive('aPositive', 'A+'),
  aNegative('aNegative', 'A-'),
  bPositive('bPositive', 'B+'),
  bNegative('bNegative', 'B-'),
  abPositive('abPositive', 'AB+'),
  abNegative('abNegative', 'AB-'),
  oPositive('oPositive', 'O+'),
  oNegative('oNegative', 'O-');

  final String value;
  final String label;
  const BloodGroup(this.value, this.label);
}

extension BloodGroupX on BloodGroup {
  static BloodGroup? tryFromValue(String? value) {
    if (value == null || value.isEmpty) return null;

    for (final g in BloodGroup.values) {
      if (g.value == value) return g;
    }
    return null;
  }
}

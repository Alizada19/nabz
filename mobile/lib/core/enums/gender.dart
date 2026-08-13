import 'package:easy_localization/easy_localization.dart';

enum Gender {
  male('male'),
  female('female'),
  other('other');

  final String value;

  const Gender(this.value);
}

extension GenderX on Gender {
  String get label => 'genders.$value'.tr();

  static Gender? tryFromValue(String? value) {
    if (value == null || value.isEmpty) return null;

    for (final gender in Gender.values) {
      if (gender.value == value) {
        return gender;
      }
    }

    return null;
  }
}

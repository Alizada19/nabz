import 'package:easy_localization/easy_localization.dart';

enum Provinces {
  kabul('kabul'),
  kandahar('kandahar'),
  herat('herat'),
  balkh('balkh'),
  nangarhar('nangarhar'),
  kunar('kunar'),
  laghman('laghman'),
  logar('logar'),
  paktya('paktya'),
  paktika('paktika'),
  ghazni('ghazni'),
  wardak('wardak'),
  parwan('parwan'),
  kapisa('kapisa'),
  panjshir('panjshir'),
  badakhshan('badakhshan'),
  baghlan('baghlan'),
  kunduz('kunduz'),
  takhar('takhar'),
  jawzjan('jawzjan'),
  sarepol('sarepol'),
  faryab('faryab'),
  badghis('badghis'),
  farah('farah'),
  nimroz('nimroz'),
  helmand('helmand'),
  zabul('zabul'),
  nuristan('nuristan'),
  bamyan('bamyan'),
  daykundi('daykundi');

  final String value;

  const Provinces(this.value);
}

extension ProvincesX on Provinces {
  String get label => 'provinces.$value'.tr();

  static Provinces? tryFromValue(String? value) {
    if (value == null || value.isEmpty) return null;

    for (final province in Provinces.values) {
      if (province.value == value) {
        return province;
      }
    }

    return null;
  }
}

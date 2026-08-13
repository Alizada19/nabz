import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/enums/blool_group.dart';
import 'package:nabz/core/enums/gender.dart';
import 'package:nabz/core/enums/provinces.dart';
import 'package:nabz/features/common/presentation/widgets/custom_action_buttons.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_datepicker_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_dropdown_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_dialog/custom_form_dialog_header.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_number_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_phone_number_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_switch_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_text_form_field.dart';
import 'package:nabz/core/utils/app_snackbar.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/features/user/data/providers/user_provider.dart';
import 'package:provider/provider.dart';

class EditUserPage extends StatefulWidget {
  final DocumentSnapshot? doc;
  const EditUserPage({super.key, this.doc});

  @override
  State<EditUserPage> createState() => _EditUserPageState();
}

class _EditUserPageState extends State<EditUserPage> {
  TextEditingController fullNameController = TextEditingController();
  TextEditingController genderController = TextEditingController();
  TextEditingController provinceController = TextEditingController();
  TextEditingController bloodGroupController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController phoneNumberController = TextEditingController();
  TextEditingController dateOfBirthController = TextEditingController();
  TextEditingController lastDonationDateController = TextEditingController();
  TextEditingController weightController = TextEditingController();
  bool hidePhoneNumber = false;
  final _formKey = GlobalKey<FormState>();
  bool _isSaving = false;
  @override
  void initState() {
    super.initState();
    if (widget.doc != null) {
      final data = widget.doc!.data() as Map<String, dynamic>;

      fullNameController.text = data['fullName'] ?? '';
      genderController.text = data['gender'] ?? '';
      provinceController.text = data['province'] ?? '';
      bloodGroupController.text = data['bloodGroop'] ?? '';
      emailController.text = data['email'] ?? '';
      phoneNumberController.text = data['phoneNumber'] ?? '';

      if (data['dateOfBirth'] is Timestamp) {
        final timestamp = data['dateOfBirth'] as Timestamp;
        dateOfBirthController.text = timestamp
            .toDate()
            .toLocal()
            .toString()
            .split(' ')[0];
      }

      if (data['lastDonationDate'] is Timestamp) {
        final timestamp = data['lastDonationDate'] as Timestamp;
        lastDonationDateController.text = timestamp
            .toDate()
            .toLocal()
            .toString()
            .split(' ')[0];
      }

      weightController.text = data['weight']?.toString() ?? '';
      hidePhoneNumber = data['hidePhoneNumber'] ?? false;
    }
  }

  @override
  void dispose() {
    fullNameController.dispose();
    genderController.dispose();
    provinceController.dispose();
    bloodGroupController.dispose();
    emailController.dispose();
    phoneNumberController.dispose();
    dateOfBirthController.dispose();
    lastDonationDateController.dispose();
    weightController.dispose();
    super.dispose();
  }

  Future<void> saveData() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final userProvider = context.read<UserProvider>();

    Timestamp? dateOfBirth;
    if (dateOfBirthController.text.isNotEmpty) {
      dateOfBirth = Timestamp.fromDate(
        DateTime.parse(dateOfBirthController.text),
      );
    }

    Timestamp? lastDonationDate;
    if (lastDonationDateController.text.isNotEmpty) {
      lastDonationDate = Timestamp.fromDate(
        DateTime.parse(lastDonationDateController.text),
      );
    }

    final user = UserModel(
      fullName: fullNameController.text.trim(),
      gender: genderController.text.trim(),
      province: provinceController.text.trim(),
      bloodGroop: bloodGroupController.text.trim(),
      dateOfBirth: dateOfBirth,
      email: emailController.text.trim().isEmpty
          ? null
          : emailController.text.trim(),
      phoneNumber: phoneNumberController.text.trim().isEmpty
          ? null
          : phoneNumberController.text.trim(),
      hidePhoneNumber: hidePhoneNumber,
      lastDonationDate: lastDonationDate,
      weight: weightController.text.trim().isEmpty
          ? null
          : int.parse(weightController.text.trim()),
      uid: widget.doc!.id,
      createdAt: widget.doc!['createdAt'] as Timestamp? ?? Timestamp.now(),
    );

    final success = await userProvider.updateUser(user);
    if (!mounted) return;

    setState(() => _isSaving = false);

    if (success) {
      Navigator.pop(context);

      AppSnackBar.success(context, 'user_updated_successfully'.tr());
    } else {
      AppSnackBar.error(context, userProvider.errorMessage);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 8,
      backgroundColor: theme.colorScheme.surface,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        constraints: const BoxConstraints(maxWidth: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomFormDialogHeader(
              title: 'update_user_info'.tr(),
              onClose: _isSaving ? null : () => Navigator.pop(context),
            ),

            Flexible(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CustomTextFormField(
                          controller: fullNameController,
                          labelText: 'full_name'.tr(),
                          hintText: 'enter_full_name'.tr(),
                          prefixIcon: Icons.person_outline,
                          enabled: !_isSaving,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'please_enter_full_name'.tr();
                            }
                            if (value.length < 2) {
                              return 'name_min_length'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        CustomDropdownField(
                          value: genderController.text.isNotEmpty
                              ? genderController.text
                              : null,
                          items: Gender.values.map((gender) {
                            return DropdownMenuItem<String>(
                              value: gender.value,
                              child: Text(gender.label),
                            );
                          }).toList(),
                          hintText: 'select_gender'.tr(),
                          labelText: 'gender'.tr(),
                          prefixIcon: Icons.wc,
                          onChanged: (value) {
                            genderController.text = value ?? '';
                          },
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'please_select_gender'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        CustomDatePickerField(
                          controller: dateOfBirthController,
                          labelText: 'date_of_birth'.tr(),
                          hintText: 'select_date_of_birth'.tr(),
                          prefixIcon: Icons.cake_outlined,
                          firstDate: DateTime(1900),
                          lastDate: DateTime.now(),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'please_select_date_of_birth'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        CustomDropdownField(
                          value: bloodGroupController.text.isNotEmpty
                              ? bloodGroupController.text
                              : null,
                          items: BloodGroup.values.map((group) {
                            return DropdownMenuItem<String>(
                              value: group.value,
                              child: Text(group.label),
                            );
                          }).toList(),
                          labelText: 'blood_group'.tr(),
                          hintText: 'select_blood_group'.tr(),
                          prefixIcon: Icons.bloodtype_outlined,
                          onChanged: (value) {
                            bloodGroupController.text = value ?? '';
                          },
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'please_select_blood_group'.tr();
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        // 10. Weight - Number Field
                        CustomNumberField(
                          controller: weightController,
                          hintText: 'enter_weight'.tr(),
                          labelText: 'weight'.tr(),
                          prefixIcon: Icons.monitor_weight_outlined,
                          min: 1,
                          max: 500,
                        ),

                        const SizedBox(height: 24),
                        CustomDatePickerField(
                          controller: lastDonationDateController,
                          hintText: 'select_last_donation_date'.tr(),
                          labelText: 'last_donation_date'.tr(),
                          prefixIcon: Icons.volunteer_activism_outlined,
                          firstDate: DateTime(2000),
                          lastDate: DateTime.now(),
                        ),

                        const SizedBox(height: 16),

                        CustomDropdownField(
                          value: provinceController.text.isNotEmpty
                              ? provinceController.text
                              : null,
                          items: Provinces.values.map((province) {
                            return DropdownMenuItem<String>(
                              value: province.value,
                              child: Text(province.label),
                            );
                          }).toList(),
                          labelText: 'province'.tr(),
                          hintText: 'select_province'.tr(),
                          prefixIcon: Icons.location_city_outlined,
                          onChanged: (value) {
                            provinceController.text = value ?? '';
                          },
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'please_select_province'.tr();
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 24),
                        CustomPhoneNumberField(
                          controller: phoneNumberController,
                          labelText: 'mobile_number'.tr(),
                          hintText: 'phone_hint'.tr(),
                          prefixIcon: Icons.call,
                        ),

                        const SizedBox(height: 24),
                        // 11. Hide Phone Number - Switch
                        CustomSwitchField(
                          value: hidePhoneNumber,
                          labelText: 'hide_phone_number'.tr(),
                          prefixIcon: Icons.visibility_off_outlined,
                          onChanged: (value) {
                            setState(() {
                              hidePhoneNumber = value;
                            });
                          },
                        ),

                        const SizedBox(height: 24),
                        CustomActionButtons(
                          isLoading: _isSaving,
                          actionText: 'update'.tr(),
                          loadingText: 'saving'.tr(),
                          actionIcon: Icons.edit,
                          onCancel: () => Navigator.pop(context),
                          onAction: saveData,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

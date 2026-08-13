import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/enums/blool_group.dart';
import 'package:nabz/core/enums/gender.dart';
import 'package:nabz/core/enums/provinces.dart';
import 'package:nabz/features/common/presentation/widgets/custom_button.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_dropdown_field.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_text_form_field.dart';
import 'package:nabz/features/navigation/presentation/pages/navigation_page.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/features/user/data/providers/user_provider.dart';
import 'package:provider/provider.dart';

class CreateUserPage extends StatefulWidget {
  const CreateUserPage({super.key});

  @override
  State<CreateUserPage> createState() => _CreateUserPageState();
}

class _CreateUserPageState extends State<CreateUserPage> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController fullNameController = TextEditingController();
  final TextEditingController genderController = TextEditingController();
  final TextEditingController bloodGroupController = TextEditingController();
  final TextEditingController provinceController = TextEditingController();

  @override
  void dispose() {
    fullNameController.dispose();
    genderController.dispose();
    bloodGroupController.dispose();
    provinceController.dispose();
    super.dispose();
  }

  Future<void> storeData() async {
    if (!_formKey.currentState!.validate()) return;

    final userProvider = context.read<UserProvider>();

    final user = UserModel(
      fullName: fullNameController.text.trim(),
      gender: genderController.text,
      province: provinceController.text,
      bloodGroop: bloodGroupController.text,
      uid: FirebaseAuth.instance.currentUser!.uid,
      createdAt: Timestamp.now(),
      hidePhoneNumber: false,
      email: null,
      phoneNumber: null,
      dateOfBirth: null,
      lastDonationDate: null,
      location: null,
      weight: null,
    );

    final success = await userProvider.createUser(user);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const NavigationPage()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(userProvider.errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();

    return Scaffold(
      appBar: AppBar(title: Text('create_profile'.tr())),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CustomTextFormField(
                  controller: fullNameController,
                  hintText: 'enter_full_name'.tr(),
                  labelText: 'full_name'.tr(),
                  prefixIcon: Icons.person_outline,
                  enabled: !userProvider.isLoading,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'please_enter_full_name'.tr();
                    }

                    if (value.trim().length < 2) {
                      return 'name_min_length'.tr();
                    }

                    return null;
                  },
                ),

                const SizedBox(height: 16),
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

                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    text: userProvider.isLoading
                        ? 'creating'.tr()
                        : 'continue'.tr(),
                    onPressed: userProvider.isLoading ? null : storeData,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

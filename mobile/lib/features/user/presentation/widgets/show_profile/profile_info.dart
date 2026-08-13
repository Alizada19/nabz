import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/enums/blool_group.dart';
import 'package:nabz/core/enums/gender.dart';
import 'package:nabz/core/enums/provinces.dart';
import 'package:nabz/features/common/presentation/widgets/custom_section_header.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/core/utils/date_formatter.dart';

class ProfileInfo extends StatelessWidget {
  final UserModel user;
  const ProfileInfo({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CustomSectionHeader(title: 'personal_information'.tr()),
        const SizedBox(height: 12),
        _buildInfoTile(
          label: 'full_name'.tr(),
          value: user.fullName,
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'gender'.tr(),
          value: GenderX.tryFromValue(user.gender)?.label ?? 'not_set'.tr(),
          icon: Icons.people_outline,
        ),
        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'blood_group'.tr(),
          value:
              BloodGroupX.tryFromValue(user.bloodGroop)?.label ??
              'not_set'.tr(),
          icon: Icons.bloodtype_outlined,
        ),
        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'province'.tr(),
          value:
              ProvincesX.tryFromValue(user.province)?.label ?? 'not_set'.tr(),
          icon: Icons.location_city_outlined,
        ),
        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'mobile_number'.tr(),
          value: user.phoneNumber!,
          icon: Icons.phone_outlined,
        ),

        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'last_donation'.tr(),
          value: DateFormatter.formatDate(user.lastDonationDate!),
          icon: Icons.calendar_today_outlined,
        ),
        const SizedBox(height: 8),
        _buildInfoTile(
          label: 'member_since'.tr(),
          value: DateFormatter.formatTimeAgo(user.createdAt),
          icon: Icons.calendar_today_outlined,
        ),
      ],
    );
  }
}

Widget _buildInfoTile({
  required String label,
  required String value,
  required IconData icon,
}) {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    decoration: BoxDecoration(
      color: Colors.grey.shade50,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: Colors.grey.shade200),
    ),
    child: Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey.shade600),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

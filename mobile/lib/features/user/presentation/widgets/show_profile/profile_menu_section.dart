import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/common/presentation/widgets/custom_section_header.dart';
import 'package:nabz/core/utils/app_snackbar.dart';
import 'package:nabz/features/user/presentation/widgets/profile_menu_item.dart';

class ProfileMenuSection extends StatelessWidget {
  const ProfileMenuSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CustomSectionHeader(title: 'menu'.tr()),
        const SizedBox(height: 8),
        ProfileMenuItem(
          icon: Icons.language_outlined,
          title: 'language'.tr(),
          subtitle: _currentLanguage(context),
          onTap: () => _showLanguageDialog(context),
        ),
        ProfileMenuItem(
          icon: Icons.bloodtype_outlined,
          title: 'my_donations'.tr(),
          subtitle: 'view_all_your_donations'.tr(),
          onTap: () => _navigateToMyDonations(context),
        ),
        ProfileMenuItem(
          icon: Icons.emergency_outlined,
          title: 'my_requests'.tr(),
          subtitle: 'view_all_your_requests'.tr(),
          onTap: () => _navigateToMyRequests(context),
        ),
        ProfileMenuItem(
          icon: Icons.notifications_outlined,
          title: 'notifications'.tr(),
          subtitle: 'manage_your_notifications'.tr(),
          onTap: () => _navigateToNotifications(context),
        ),
        ProfileMenuItem(
          icon: Icons.security_outlined,
          title: 'privacy_security'.tr(),
          subtitle: 'manage_your_privacy_settings'.tr(),
          onTap: () => _navigateToPrivacy(context),
        ),
        ProfileMenuItem(
          icon: Icons.help_outline,
          title: 'help_support'.tr(),
          subtitle: 'get_help_and_support'.tr(),
          onTap: () => _navigateToHelp(context),
        ),
      ],
    );
  }
}

String _currentLanguage(BuildContext context) {
  switch (context.locale.languageCode) {
    case 'fa':
      return 'فارسی';
    case 'ps':
      return 'پښتو';
    default:
      return 'English';
  }
}

void _showLanguageDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('English'),
              onTap: () async {
                await context.setLocale(const Locale('en'));
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('فارسی'),
              onTap: () async {
                await context.setLocale(const Locale('fa'));
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('پښتو'),
              onTap: () async {
                await context.setLocale(const Locale('ps'));
                Navigator.pop(context);
              },
            ),
          ],
        ),
      );
    },
  );
}

void _navigateToMyDonations(BuildContext context) {
  AppSnackBar.info(context, 'My donations coming soon');
}

void _navigateToMyRequests(BuildContext context) {
  AppSnackBar.info(context, 'My requests coming soon');
}

void _navigateToNotifications(BuildContext context) {
  AppSnackBar.info(context, 'Notifications coming soon');
}

void _navigateToPrivacy(BuildContext context) {
  AppSnackBar.info(context, 'Privacy settings coming soon');
}

void _navigateToHelp(BuildContext context) {
  AppSnackBar.info(context, 'Help & support coming soon');
}

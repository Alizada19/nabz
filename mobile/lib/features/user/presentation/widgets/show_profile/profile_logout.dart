import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/auth/email/presentation/widgets/logout_dialog.dart';

class ProfileLogout extends StatelessWidget {
  const ProfileLogout({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => _logout(context),
        icon: const Icon(Icons.logout_outlined, color: Colors.red),
        label: Text('logout'.tr(), style: TextStyle(color: Colors.red)),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          side: const BorderSide(color: Colors.red),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

Future<void> _logout(BuildContext context) async {
  await LogoutDialog.confirmAndLogout(context);
}

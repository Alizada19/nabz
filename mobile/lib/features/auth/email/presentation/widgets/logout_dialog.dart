import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/auth/email/data/provider/email_auth_provider.dart';
import 'package:nabz/features/auth/email/presentation/pages/auth_page.dart';
import 'package:provider/provider.dart';

class LogoutDialog {
  static Future<bool?> show(BuildContext context) async {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('logout'.tr()),
        content: Text('logout_confirmation'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('logout'.tr(), style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  static Future<void> confirmAndLogout(BuildContext context) async {
    final shouldLogout = await show(context);

    if (shouldLogout == true) {
      final emailAuthProvider = Provider.of<EmailAuthProvider>(
        context,
        listen: false,
      );
      await emailAuthProvider.signOut();

      if (context.mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const AuthPage()),
          (route) => false,
        );
      }
    }
  }
}

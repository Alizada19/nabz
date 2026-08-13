import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/auth/email/data/provider/email_auth_provider.dart';
import 'package:nabz/features/auth/email/presentation/widgets/logout_dialog.dart';
import 'package:nabz/features/auth/phone/presentation/widgets/sign_in_button.dart';
import 'package:nabz/features/user/data/providers/user_provider.dart';
import 'package:nabz/features/user/presentation/pages/profile_page.dart';
import 'package:nabz/features/user/presentation/widgets/user_menu_button.dart';
import 'package:provider/provider.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final Color? backgroundColor;

  const CustomAppBar({super.key, required this.title, this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer2<EmailAuthProvider, UserProvider>(
      builder: (context, authProvider, userProvider, child) {
        final bool isLoggedIn = authProvider.isSignedIn;

        String userName = 'user'.tr();
        if (userProvider.currentUser != null) {
          final fullName = userProvider.currentUser!.fullName;
          if (fullName.isNotEmpty) {
            userName = fullName;
          }
        }

        return AppBar(
          centerTitle: true,
          backgroundColor: backgroundColor ?? theme.colorScheme.primary,
          title: Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          actions: [
            if (isLoggedIn)
              UserMenuButton(
                userName: userName,
                onProfileTap: () => _navigateToProfile(context),
                onDonationsTap: () => _navigateToMyDonations(context),
                onRequestsTap: () => _navigateToMyRequests(context),
                onLogoutTap: () => _logout(context),
              )
            else
              const SignInButton(),
          ],
        );
      },
    );
  }

  void _navigateToProfile(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ProfilePage()),
    );
  }

  Future<void> _logout(BuildContext context) async {
    await LogoutDialog.confirmAndLogout(context);
  }

  void _navigateToMyDonations(BuildContext context) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('My donations coming soon')));
  }

  void _navigateToMyRequests(BuildContext context) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('My requests coming soon')));
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

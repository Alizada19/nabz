import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/navigation/presentation/pages/navigation_page.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/features/user/presentation/widgets/edit_user_page.dart';

class ProfileHeader extends StatelessWidget {
  final UserModel user;
  final String? email;

  const ProfileHeader({super.key, required this.user, required this.email});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SliverAppBar(
      expandedHeight: 140,
      pinned: true,
      backgroundColor: theme.colorScheme.primary,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                theme.colorScheme.primary,
                theme.colorScheme.primary.withValues(alpha: 0.7),
              ],
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  user.fullName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email ?? 'no_email_provided'.tr(),
                  style: const TextStyle(fontSize: 14, color: Colors.white70),
                ),
              ],
            ),
          ),
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.home_outlined, color: Colors.white),
        onPressed: () => _navigateToMainPage(context),
        tooltip: 'back_to_home'.tr(),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.edit_outlined, color: Colors.white),
          onPressed: () => _navigateToEditProfile(context, user),
          tooltip: 'edit_profile'.tr(),
        ),
      ],
    );
  }
}

void _navigateToMainPage(BuildContext context) {
  Navigator.pushReplacement(
    context,
    MaterialPageRoute(builder: (_) => const NavigationPage()),
  );
}

void _navigateToEditProfile(BuildContext context, UserModel user) async {
  final docRef = await FirebaseFirestore.instance
      .collection('users')
      .doc(user.uid)
      .get();
  if (!context.mounted) return;
  await showDialog(
    context: context,
    builder: (dialogContext) => EditUserPage(doc: docRef),
  );
}

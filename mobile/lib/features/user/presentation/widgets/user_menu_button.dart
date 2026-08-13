import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class UserMenuButton extends StatelessWidget {
  final String userName;
  final VoidCallback? onProfileTap;
  final VoidCallback? onDonationsTap;
  final VoidCallback? onRequestsTap;
  final VoidCallback? onLogoutTap;

  const UserMenuButton({
    super.key,
    required this.userName,
    this.onProfileTap,
    this.onDonationsTap,
    this.onRequestsTap,
    this.onLogoutTap,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 40),
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _getDisplayName(userName),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.white,
              ),
            ),
            const Icon(Icons.arrow_drop_down, color: Colors.white, size: 20),
          ],
        ),
      ),
      onSelected: (value) async {
        switch (value) {
          case 'profile':
            onProfileTap?.call();
            break;
          case 'donations':
            onDonationsTap?.call();
            break;
          case 'requests':
            onRequestsTap?.call();
            break;
          case 'logout':
            onLogoutTap?.call();
            break;
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: 'profile',
          child: Row(
            children: [
              const Icon(Icons.person_outline, size: 20),
              const SizedBox(width: 12),
              Text('my_profile'.tr()),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'donations',
          child: Row(
            children: [
              const Icon(Icons.bloodtype_outlined, size: 20),
              const SizedBox(width: 12),
              Text('my_donations'.tr()),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'requests',
          child: Row(
            children: [
              Icon(Icons.emergency_outlined, size: 20),
              SizedBox(width: 12),
              Text('my_requests'.tr()),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'logout',
          child: Row(
            children: [
              Icon(Icons.logout_outlined, size: 20),
              SizedBox(width: 12),
              Text('logout'.tr()),
            ],
          ),
        ),
      ],
    );
  }

  String _getDisplayName(String name) {
    if (name == 'User' || name.isEmpty) {
      return 'User';
    }

    if (name.length > 12) {
      return '${name.substring(0, 10)}...';
    }
    return name;
  }
}

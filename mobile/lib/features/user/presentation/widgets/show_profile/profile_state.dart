import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/user/data/models/user_model.dart';

class ProfileState extends StatelessWidget {
  final UserModel user;
  const ProfileState({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            context,
            'donations'.tr(),
            '12',
            Icons.bloodtype,
            theme.colorScheme.primary,
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          _buildStatItem(
            context,
            'requests'.tr(),
            '5',
            Icons.emergency,
            Colors.orange,
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          _buildStatItem(
            context,
            'weight'.tr(),
            user.weight != null ? '${user.weight}' : 'not_available'.tr(),
            Icons.fitness_center,
            Colors.green,
          ),
        ],
      ),
    );
  }
}

Widget _buildStatItem(
  BuildContext context,
  String label,
  String value,
  IconData icon,
  Color color,
) {
  return Column(
    children: [
      Icon(icon, color: color, size: 24),
      const SizedBox(height: 8),
      Text(
        value,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
    ],
  );
}

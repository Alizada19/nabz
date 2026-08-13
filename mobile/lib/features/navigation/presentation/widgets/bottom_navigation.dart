import 'package:flutter/material.dart';
import 'package:nabz/features/navigation/presentation/pages/navigation_page.dart';

class BottomNavigation extends StatelessWidget {
  final VoidCallback onPressed;
  final Icon icon;
  final Menus current;
  final Menus name;
  final String label;

  const BottomNavigation({
    super.key,
    required this.onPressed,
    required this.icon,
    required this.current,
    required this.name,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bool isSelected = current == name;

    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(0), // Removes ripple corner radius
      child: Container(
        height: double.infinity,
        color: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconTheme(
              data: IconThemeData(
                size: 24,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
              ),
              child: icon,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

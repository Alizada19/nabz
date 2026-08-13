import 'package:flutter/material.dart';
import 'package:nabz/core/constants/app_colors.dart';
import 'package:nabz/core/utils/app_snackbar.dart';
import 'package:nabz/features/common/presentation/widgets/custom_action_buttons.dart';
import 'package:nabz/features/crud/data/providers/crud_provider.dart';
import 'package:provider/provider.dart';

class RemoveDialog extends StatefulWidget {
  final String documentId;
  final String itemName;
  const RemoveDialog({
    super.key,
    required this.documentId,
    required this.itemName,
  });

  @override
  State<RemoveDialog> createState() => _RemoveDialogState();
}

class _RemoveDialogState extends State<RemoveDialog> {
  bool _isDeleting = false;
  Future<void> _deleteCrud() async {
    setState(() {
      _isDeleting = true;
    });

    final provider = context.read<CrudProvider>();
    final success = await provider.deleteCrud(widget.documentId);
    if (!mounted) return;
    setState(() {
      _isDeleting = false;
    });
    Navigator.pop(context);

    if (success) {
      AppSnackBar.success(context, "'${widget.itemName}' has been deleted");
    } else {
      AppSnackBar.error(context, provider.errorMessage);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 8,
      backgroundColor: theme.colorScheme.surface,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.85,
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.error.withValues(alpha: 0.1),
              ),
              padding: const EdgeInsets.all(16),
              child: Icon(
                Icons.warning_rounded,
                size: 64,
                color: theme.colorScheme.error,
              ),
            ),

            const SizedBox(height: 20),

            Text(
              'Delete Item',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.error,
              ),
            ),

            const SizedBox(height: 12),

            Text(
              'Are you sure you want to delete',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: theme.colorScheme.error.withValues(alpha: 0.3),
                ),
              ),
              child: Text(
                '"${widget.itemName}"',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              'This action cannot be undone.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            CustomActionButtons(
              isLoading: _isDeleting,
              actionText: 'Delete',
              loadingText: 'Deleting...',
              actionIcon: Icons.delete_outline,
              actionColor: theme.colorScheme.error,
              onCancel: () => Navigator.pop(context),
              onAction: _deleteCrud,
            ),
          ],
        ),
      ),
    );
  }
}

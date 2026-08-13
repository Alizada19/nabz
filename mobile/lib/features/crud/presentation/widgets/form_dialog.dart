import 'package:flutter/material.dart';
import 'package:nabz/features/common/presentation/widgets/custom_action_buttons.dart';
import 'package:nabz/features/common/presentation/widgets/form_dialog/custom_form_dialog_header.dart';
import 'package:nabz/features/common/presentation/widgets/form_fields/custom_text_form_field.dart';
import 'package:nabz/core/utils/app_snackbar.dart';
import 'package:nabz/features/crud/data/models/crud_model.dart';
import 'package:nabz/features/crud/data/providers/crud_provider.dart';
import 'package:provider/provider.dart';

class FormDialog extends StatefulWidget {
  final CrudModel? crud;
  const FormDialog({super.key, this.crud});

  @override
  State<FormDialog> createState() => _FormDialogState();
}

class _FormDialogState extends State<FormDialog> {
  TextEditingController nameController = TextEditingController();
  TextEditingController positionController = TextEditingController();

  final _formKey = GlobalKey<FormState>();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();

    if (widget.crud != null) {
      nameController.text = widget.crud!.name;
      positionController.text = widget.crud!.position;
    }
  }

  @override
  void dispose() {
    nameController.dispose();
    positionController.dispose();
    super.dispose();
  }

  Future<void> saveData() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final crudProvider = context.read<CrudProvider>();
    final success = widget.crud == null
        ? await crudProvider.createCrud(
            nameController.text.trim(),
            positionController.text.trim(),
          )
        : await crudProvider.updateCrud(
            widget.crud!.id,
            nameController.text.trim(),
            positionController.text.trim(),
          );

    if (!mounted) return;

    setState(() => _isSaving = false);

    if (success) {
      Navigator.pop(context);

      AppSnackBar.success(
        context,
        widget.crud == null
            ? 'crud created successfully'
            : 'crud updated successfully',
      );
    } else {
      AppSnackBar.error(context, crudProvider.errorMessage);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isEdit = widget.crud != null;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 8,
      backgroundColor: theme.colorScheme.surface,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        constraints: const BoxConstraints(maxWidth: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomFormDialogHeader(
              title: isEdit ? "Edit Item" : "Create New Item",
              onClose: _isSaving ? null : () => Navigator.pop(context),
            ),

            Flexible(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CustomTextFormField(
                          controller: nameController,
                          hintText: "e.g., Nuyan Shahbazi",
                          labelText: "Full Name",
                          prefixIcon: Icons.person_outline,
                          enabled: !_isSaving,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter full name';
                            }
                            if (value.length < 2) {
                              return 'full name must be at least 2 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        CustomTextFormField(
                          controller: positionController,
                          hintText: "e.g., Software Developer",
                          labelText: "Position",
                          prefixIcon: Icons.work_outline,
                          enabled: !_isSaving,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter a position';
                            }
                            if (value.length < 2) {
                              return 'Position must be at least 2 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        CustomActionButtons(
                          isLoading: _isSaving,
                          actionText: isEdit ? "Update" : "Create",
                          loadingText: "Saving...",
                          actionIcon: isEdit ? Icons.edit : Icons.add,
                          onCancel: () => Navigator.pop(context),
                          onAction: saveData,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

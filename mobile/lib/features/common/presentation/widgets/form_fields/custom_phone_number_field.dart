import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomPhoneNumberField extends StatelessWidget {
  final TextEditingController? controller;
  final String hintText;
  final String labelText;
  final IconData prefixIcon;
  final bool enabled;
  final bool required;
  final String? Function(String?)? validator;

  const CustomPhoneNumberField({
    super.key,
    this.controller,
    this.hintText = '07XXXXXXXX',
    this.labelText = 'Phone Number',
    this.prefixIcon = Icons.phone_outlined,
    this.enabled = true,
    this.required = false,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TextFormField(
      controller: controller,
      enabled: enabled,
      keyboardType: TextInputType.phone,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[0-9+]')),
        LengthLimitingTextInputFormatter(15),
      ],
      validator:
          validator ??
          (value) {
            if (!required && (value == null || value.trim().isEmpty)) {
              return null;
            }

            if (value == null || value.trim().isEmpty) {
              return 'Please enter a phone number';
            }

            final phone = value.trim();

            if (!RegExp(r'^\+?[0-9]{9,15}$').hasMatch(phone)) {
              return 'Enter a valid phone number';
            }

            return null;
          },
      decoration: InputDecoration(
        hintText: hintText,
        labelText: labelText,
        prefixIcon: Icon(prefixIcon),
        hintStyle: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
        labelStyle: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
        filled: true,
        fillColor: enabled
            ? theme.colorScheme.surface
            : theme.colorScheme.surfaceBright,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: theme.colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: theme.colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: theme.primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: theme.colorScheme.outline.withValues(alpha: 0.5),
          ),
        ),
      ),
    );
  }
}

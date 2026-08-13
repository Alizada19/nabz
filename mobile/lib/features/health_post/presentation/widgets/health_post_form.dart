import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class HealthPostForm extends StatelessWidget {
  final TextEditingController titleController;
  final TextEditingController contentController;
  final TextEditingController doctorNameController;
  final TextEditingController doctorSpecializationController;

  const HealthPostForm({
    Key? key,
    required this.titleController,
    required this.contentController,
    required this.doctorNameController,
    required this.doctorSpecializationController,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Set Name',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: isDarkMode ? AppColors.darkText : AppColors.lightText,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: titleController,
          decoration: InputDecoration(
            labelText: 'Full Name / Title',
            labelStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            border: const OutlineInputBorder(),
            prefixIcon: Icon(
              Icons.title,
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            hintText: 'Enter post title',
            hintStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          style: TextStyle(
            color: isDarkMode ? AppColors.darkText : AppColors.lightText,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter a title';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: doctorNameController,
          decoration: InputDecoration(
            labelText: 'Doctor Full Name',
            labelStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            border: const OutlineInputBorder(),
            prefixIcon: Icon(
              Icons.person,
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            hintText: "Enter doctor's full name",
            hintStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          style: TextStyle(
            color: isDarkMode ? AppColors.darkText : AppColors.lightText,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter doctor name';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: doctorSpecializationController,
          decoration: InputDecoration(
            labelText: 'Doctor Specialization',
            labelStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            border: const OutlineInputBorder(),
            prefixIcon: Icon(
              Icons.medical_services,
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            hintText: 'e.g., Cardiologist, Neurologist',
            hintStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          style: TextStyle(
            color: isDarkMode ? AppColors.darkText : AppColors.lightText,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter specialization';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: contentController,
          decoration: InputDecoration(
            labelText: 'Description',
            labelStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            border: const OutlineInputBorder(),
            prefixIcon: Icon(
              Icons.description,
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            hintText: 'Enter detailed description',
            hintStyle: TextStyle(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          style: TextStyle(
            color: isDarkMode ? AppColors.darkText : AppColors.lightText,
          ),
          maxLines: 5,
          minLines: 3,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter description';
            }
            return null;
          },
        ),
      ],
    );
  }
}
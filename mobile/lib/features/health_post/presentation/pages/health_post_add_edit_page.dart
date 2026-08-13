import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/models/health_post_model.dart';
import '../../data/providers/health_post_provider.dart';
import '../widgets/health_post_form.dart';

class HealthPostAddEditPage extends StatefulWidget {
  final HealthPostModel? healthPost;

  const HealthPostAddEditPage({Key? key, this.healthPost}) : super(key: key);

  @override
  State<HealthPostAddEditPage> createState() => _HealthPostAddEditPageState();
}

class _HealthPostAddEditPageState extends State<HealthPostAddEditPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  late TextEditingController _doctorNameController;
  late TextEditingController _doctorSpecializationController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.healthPost?.title ?? '');
    _contentController = TextEditingController(text: widget.healthPost?.content ?? '');
    _doctorNameController = TextEditingController(text: widget.healthPost?.doctorFullName ?? '');
    _doctorSpecializationController = TextEditingController(text: widget.healthPost?.doctorSpecialization ?? '');
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _doctorNameController.dispose();
    _doctorSpecializationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.healthPost != null;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isEditing ? 'edit_health_post'.tr() : 'create_new_health_post'.tr(),
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  HealthPostForm(
                    titleController: _titleController,
                    contentController: _contentController,
                    doctorNameController: _doctorNameController,
                    doctorSpecializationController: _doctorSpecializationController,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(
                              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ),
                          child: Text('cancel'.tr()),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            elevation: 2,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : Text(
                                  isEditing ? 'update_post'.tr() : 'create_post'.tr(),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final healthPost = HealthPostModel(
      id: widget.healthPost?.id,
      title: _titleController.text.trim(),
      content: _contentController.text.trim(),
      doctorFullName: _doctorNameController.text.trim(),
      doctorSpecialization: _doctorSpecializationController.text.trim(),
      likes: widget.healthPost?.likes ?? 0,
      isApproved: widget.healthPost?.isApproved ?? false,
      createdAt: widget.healthPost?.createdAt ?? DateTime.now(),
    );

    final provider = context.read<HealthPostProvider>();
    
    try {
      if (widget.healthPost != null) {
        await provider.updateHealthPost(widget.healthPost!.id!, healthPost);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Post updated successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        await provider.createHealthPost(healthPost);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Post created successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}
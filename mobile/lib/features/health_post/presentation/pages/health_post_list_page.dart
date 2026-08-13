import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/providers/health_post_provider.dart';
import '../../data/models/health_post_model.dart';
import '../widgets/health_post_card.dart';
import 'health_post_add_edit_page.dart';
import 'health_post_detail_page.dart';

class HealthPostListPage extends StatefulWidget {
  const HealthPostListPage({Key? key}) : super(key: key);

  @override
  State<HealthPostListPage> createState() => _HealthPostListPageState();
}

class _HealthPostListPageState extends State<HealthPostListPage> {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'health_posts'.tr(),
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          Consumer<HealthPostProvider>(
            builder: (context, provider, child) {
              return IconButton(
                icon: Icon(
                  provider.showOnlyApproved 
                      ? Icons.filter_alt 
                      : Icons.filter_alt_outlined,
                  color: provider.showOnlyApproved ? Colors.yellow : Colors.white,
                ),
                onPressed: () {
                  provider.setShowOnlyApproved(!provider.showOnlyApproved);
                },
                tooltip: 'show_only_approved'.tr(),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => _navigateToAddEditPage(),
            tooltip: 'add_new'.tr(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              context.read<HealthPostProvider>().resetToSampleData();
            },
            tooltip: 'Reset to sample data',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Consumer<HealthPostProvider>(
            builder: (context, provider, child) {
              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'search_posts'.tr(),
                    prefixIcon: const Icon(Icons.search, color: Colors.white),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.2),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                    hintStyle: const TextStyle(color: Colors.white70),
                    suffixIcon: provider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.white),
                            onPressed: () => provider.setSearchQuery(''),
                          )
                        : null,
                  ),
                  style: const TextStyle(color: Colors.white),
                  onChanged: provider.setSearchQuery,
                ),
              );
            },
          ),
        ),
      ),
      body: Consumer<HealthPostProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading...'),
                ],
              ),
            );
          }

          if (provider.posts.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.medical_services,
                    size: 80,
                    color: isDarkMode ? Colors.grey.shade600 : Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    provider.searchQuery.isNotEmpty 
                        ? 'no_matching_posts'.tr() 
                        : 'no_health_posts'.tr(),
                    style: TextStyle(
                      fontSize: 20,
                      color: isDarkMode ? Colors.grey.shade300 : Colors.grey.shade600,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    provider.searchQuery.isNotEmpty 
                        ? 'try_adjusting_search'.tr() 
                        : 'tap_plus_to_create'.tr(),
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey.shade400 : Colors.grey.shade500,
                    ),
                  ),
                  if (provider.showOnlyApproved && provider.searchQuery.isEmpty) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => provider.setShowOnlyApproved(false),
                      child: Text(
                        'show_all_posts'.tr(),
                        style: TextStyle(color: AppColors.primary),
                      ),
                    ),
                  ],
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              provider.resetToSampleData();
            },
            color: AppColors.primary,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.posts.length,
              itemBuilder: (context, index) {
                final post = provider.posts[index];
                return HealthPostCard(
                  healthPost: post,
                  onTap: () => _navigateToDetailPage(post),
                  onEdit: () => _navigateToAddEditPage(healthPost: post),
                  onDelete: () => _showDeleteDialog(post),
                  onToggleLike: () => provider.toggleLike(post.id!),
                  onToggleApproval: () => provider.toggleApproval(post.id!),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _navigateToAddEditPage({HealthPostModel? healthPost}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => HealthPostAddEditPage(
          healthPost: healthPost,
        ),
      ),
    ).then((_) {
      // Refresh after returning
    });
  }

  void _navigateToDetailPage(HealthPostModel post) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => HealthPostDetailPage(healthPost: post),
      ),
    );
  }

  void _showDeleteDialog(HealthPostModel post) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(Icons.delete_outline, color: AppColors.error),
            const SizedBox(width: 8),
            Text('delete_item'.tr()),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('delete_confirmation'.tr()),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    '${'by_doctor'.tr()} ${post.doctorFullName}',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'action_cannot_be_undone'.tr(),
              style: TextStyle(
                color: AppColors.error,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<HealthPostProvider>().deleteHealthPost(post.id!);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Post deleted successfully'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: Text('delete'.tr()),
          ),
        ],
      ),
    );
  }
}
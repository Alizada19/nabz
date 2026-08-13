import 'package:flutter/material.dart';
import 'package:nabz/features/auth/email/data/provider/email_auth_provider.dart';
import 'package:nabz/core/utils/app_error_view.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/features/user/data/providers/user_provider.dart';
import 'package:nabz/features/user/presentation/widgets/show_profile/profile_header.dart';
import 'package:nabz/features/user/presentation/widgets/show_profile/profile_info.dart';
import 'package:nabz/features/user/presentation/widgets/show_profile/profile_logout.dart';
import 'package:nabz/features/user/presentation/widgets/show_profile/profile_menu_section.dart';
import 'package:nabz/features/user/presentation/widgets/show_profile/profile_state.dart';
import 'package:provider/provider.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final userProvider = Provider.of<UserProvider>(context);
    final emailAuthProvider = Provider.of<EmailAuthProvider>(context);

    final UserModel? user = userProvider.currentUser;
    final bool isLoading = userProvider.isLoading;

    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : user == null
          ? _buildErrorView(context)
          : _buildProfileContent(context, theme, user, emailAuthProvider),
    );
  }

  Widget _buildErrorView(BuildContext context) {
    return AppErrorView(
      title: 'No user data found',
      message: 'Please try again later',
      onRetry: () {
        final provider = Provider.of<UserProvider>(context, listen: false);
        provider.fetchUserData();
      },
    );
  }

  Widget _buildProfileContent(
    BuildContext context,
    ThemeData theme,
    UserModel user,
    EmailAuthProvider emailAuthProvider,
  ) {
    final String? email = emailAuthProvider.userEmail;

    return CustomScrollView(
      slivers: [
        ProfileHeader(user: user, email: email),
        // Profile Content
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Stats Section
              ProfileState(user: user),
              const SizedBox(height: 24),
              ProfileInfo(user: user),
              const SizedBox(height: 24),
              ProfileMenuSection(),
              const SizedBox(height: 24),
              ProfileLogout(),
              const SizedBox(height: 24),
            ]),
          ),
        ),
      ],
    );
  }
}

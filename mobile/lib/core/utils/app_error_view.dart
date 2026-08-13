import 'package:flutter/material.dart';

class AppErrorView extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color? iconColor;
  final VoidCallback? onRetry;
  final String retryButtonText;

  const AppErrorView({
    super.key,
    this.title = 'Something went wrong',
    this.message = 'Please try again later',
    this.icon = Icons.error_outline,
    this.iconColor,
    this.onRetry,
    this.retryButtonText = 'Retry',
  });

  /// Factory constructor for network errors
  factory AppErrorView.networkError({VoidCallback? onRetry}) {
    return AppErrorView(
      title: 'Network Error',
      message: 'Please check your internet connection and try again',
      icon: Icons.wifi_off_outlined,
      iconColor: Colors.orange,
      onRetry: onRetry,
    );
  }

  /// Factory constructor for server errors
  factory AppErrorView.serverError({VoidCallback? onRetry}) {
    return AppErrorView(
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      icon: Icons.error_outline,
      iconColor: Colors.red,
      onRetry: onRetry,
    );
  }

  /// Factory constructor for empty states
  factory AppErrorView.emptyState({
    String title = 'No Data Available',
    String message = 'Nothing to show here',
    VoidCallback? onRetry,
  }) {
    return AppErrorView(
      title: title,
      message: message,
      icon: Icons.inbox_outlined,
      iconColor: Colors.grey,
      onRetry: onRetry,
    );
  }

  /// Factory constructor for user not found
  factory AppErrorView.userNotFound({VoidCallback? onRetry}) {
    return AppErrorView(
      title: 'User Not Found',
      message: 'We couldn\'t find your user data. Please try again.',
      icon: Icons.person_off_outlined,
      iconColor: Colors.blue,
      onRetry: onRetry,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: iconColor ?? Colors.grey.shade400),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(onPressed: onRetry, child: Text(retryButtonText)),
            ],
          ],
        ),
      ),
    );
  }
}

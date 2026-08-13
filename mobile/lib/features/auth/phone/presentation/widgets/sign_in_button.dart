import 'package:flutter/material.dart';
import 'package:nabz/features/auth/email/presentation/pages/auth_page.dart';

class SignInButton extends StatelessWidget {
  final VoidCallback? onPressed;

  const SignInButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 16),
      child: TextButton(
        onPressed:
            onPressed ??
            () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const AuthPage()),
              );
            },
        style: TextButton.styleFrom(foregroundColor: Colors.white),
        child: const Text('Sign In'),
      ),
    );
  }
}

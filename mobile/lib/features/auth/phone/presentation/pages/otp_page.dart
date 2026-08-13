import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/auth/phone/data/providers/auth_provider.dart';
import 'package:nabz/features/common/presentation/widgets/custom_button.dart';
import 'package:nabz/core/utils/utils.dart';
import 'package:nabz/features/navigation/presentation/pages/navigation_page.dart';
import 'package:nabz/features/user/presentation/pages/create_user_page.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';

class OtpPage extends StatefulWidget {
  final String verificationId;
  const OtpPage({super.key, required this.verificationId});

  @override
  State<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends State<OtpPage> {
  final TextEditingController pinController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final ap = context.watch<AuthProvider>();

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 35),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.topLeft,
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.arrow_back),
                  ),
                ),
                Container(
                  width: 200,
                  height: 200,
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.purple.shade50,
                  ),
                  child: Image.asset("assets/images/image3.png"),
                ),
                const SizedBox(height: 20),
                Text(
                  "Verification",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text(
                  "Enter verification code that sent to your phone number.",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black38,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                Pinput(
                  length: 6,
                  controller: pinController,
                  showCursor: true,
                  defaultPinTheme: PinTheme(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.purple.shade200),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: 50,
                  child: CustomButton(
                    text: ap.isVerifyingOtp ? "Verifying..." : "Verify",
                    onPressed: ap.isVerifyingOtp
                        ? null
                        : () {
                            String code = pinController.text.trim();
                            if (code.length == 6) {
                              verifyOtp(context, code);
                            } else {
                              showSnackbar(context, "Enter 6-Digit code");
                            }
                          },
                  ),
                ),
                const SizedBox(height: 20),
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    children: [
                      const TextSpan(
                        text: "Didn't receive any code? ",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black38,
                        ),
                      ),
                      TextSpan(
                        text: "Resend",
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.purple,
                        ),
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            // TODO: Implement resend logic
                            showSnackbar(
                              context,
                              "Resend OTP not implemented yet",
                            );
                          },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void verifyOtp(BuildContext context, String userOtp) async {
    final ap = Provider.of<AuthProvider>(context, listen: false);

    // Verify OTP
    await ap.verifyOtp(
      context: context,
      verificationId: widget.verificationId,
      userOtp: userOtp,
      onSuccess: () async {
        // After successful verification, check if user exists
        final bool isExisting = await ap.checkExistingUser();

        if (isExisting) {
          // User exists - go to home
          if (context.mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const NavigationPage()),
              (route) => false,
            );
          }
        } else {
          // New user - go to profile creation
          if (context.mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const CreateUserPage()),
              (route) => false,
            );
          }
        }
      },
    );
  }
}

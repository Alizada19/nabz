import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/auth/phone/presentation/pages/otp_page.dart';
import 'package:nabz/core/utils/utils.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  // ==========================
  // Auth State
  // ==========================
  bool _isSignedIn = false;
  bool get isSignedIn => _isSignedIn;

  final bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isSendingOtp = false;
  bool get isSendingOtp => _isSendingOtp;

  bool _isVerifyingOtp = false;
  bool get isVerifyingOtp => _isVerifyingOtp;

  String? _uid;
  String? get uid => _uid;

  // ==========================
  // Firebase Instances
  // ==========================
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;

  AuthProvider() {
    _initializeAuth();
  }

  // ==========================
  // Initialization
  // ==========================
  Future<void> _initializeAuth() async {
    print('🔍 Initializing auth...');
    await checkSignIn();
    print('✅ Auth initialized, isSignedIn: $_isSignedIn');
  }

  // ==========================
  // Check Sign-in Status
  // ==========================
  Future<void> checkSignIn() async {
    try {
      final SharedPreferences s = await SharedPreferences.getInstance();
      final bool signedIn = s.getBool("is_signedin") ?? false;
      print('📱 SharedPreferences signedIn: $signedIn');

      if (signedIn) {
        // Verify with Firebase
        final User? currentUser = _firebaseAuth.currentUser;
        if (currentUser != null) {
          _uid = currentUser.uid;
          _isSignedIn = true;
          print('✅ User is signed in: ${currentUser.uid}');
        } else {
          // Firebase user doesn't exist, clear session
          print('⚠️ Firebase user not found, clearing session...');
          await s.clear();
          _isSignedIn = false;
          _uid = null;
        }
      } else {
        // Check if Firebase has a user (maybe signed in but not saved to SP)
        final User? currentUser = _firebaseAuth.currentUser;
        if (currentUser != null) {
          print('👤 Firebase user found: ${currentUser.uid}');
          _uid = currentUser.uid;
          _isSignedIn = true;
          await s.setBool("is_signedin", true);
          print('✅ Restored session from Firebase');
        } else {
          _isSignedIn = false;
          _uid = null;
          print('❌ No user found');
        }
      }

      notifyListeners();
    } catch (e) {
      print('❌ Error in checkSignIn: $e');
      _isSignedIn = false;
      _uid = null;
      notifyListeners();
    }
  }

  // ==========================
  // Sign In with Phone
  // ==========================
  Future<void> signInWithPhone(BuildContext context, String phoneNumber) async {
    try {
      _isSendingOtp = true;
      notifyListeners();

      await _firebaseAuth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _firebaseAuth.signInWithCredential(credential);
          _isSendingOtp = false;
          _isSignedIn = true;
          _uid = _firebaseAuth.currentUser?.uid;

          final SharedPreferences s = await SharedPreferences.getInstance();
          await s.setBool("is_signedin", true);

          notifyListeners();

          if (context.mounted) {
            // Check if user exists and navigate accordingly
            final bool userExists = await checkExistingUser();
            if (userExists) {
              Navigator.pushReplacementNamed(context, '/home');
            } else {
              Navigator.pushReplacementNamed(context, '/create-profile');
            }
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          _isSendingOtp = false;
          notifyListeners();
          if (context.mounted) {
            showSnackbar(context, e.message ?? 'Verification failed');
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          _isSendingOtp = false;
          notifyListeners();
          if (context.mounted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => OtpPage(verificationId: verificationId),
              ),
            );
          }
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _isSendingOtp = false;
          notifyListeners();
        },
      );
    } on FirebaseAuthException catch (e) {
      _isSendingOtp = false;
      notifyListeners();
      if (context.mounted) {
        showSnackbar(context, e.message ?? 'Failed to send OTP');
      }
    }
  }

  // ==========================
  // Verify OTP
  // ==========================
  Future<void> verifyOtp({
    required BuildContext context,
    required String verificationId,
    required String userOtp,
    required VoidCallback onSuccess,
  }) async {
    try {
      _isVerifyingOtp = true;
      notifyListeners();

      final PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: userOtp,
      );

      final UserCredential userCredential = await _firebaseAuth
          .signInWithCredential(credential);

      final User? user = userCredential.user;

      if (user != null) {
        _uid = user.uid;
        _isSignedIn = true;

        final SharedPreferences s = await SharedPreferences.getInstance();
        await s.setBool("is_signedin", true);

        print('✅ User verified: ${user.uid}');
        notifyListeners();
        onSuccess();
      }

      _isVerifyingOtp = false;
      notifyListeners();
    } on FirebaseAuthException catch (e) {
      _isVerifyingOtp = false;
      notifyListeners();
      if (context.mounted) {
        showSnackbar(context, e.message ?? 'OTP verification failed');
      }
    }
  }

  // ==========================
  // Check if user exists in Firestore
  // ==========================
  Future<bool> checkExistingUser() async {
    try {
      final String? uid = _firebaseAuth.currentUser?.uid;
      if (uid == null) return false;

      final DocumentSnapshot snapshot = await _firebaseFirestore
          .collection("users")
          .doc(uid)
          .get();

      return snapshot.exists;
    } catch (e) {
      print('❌ Error checking user: $e');
      return false;
    }
  }

  // ==========================
  // Get current user UID (synchronous)
  // ==========================
  String? getCurrentUid() {
    return _firebaseAuth.currentUser?.uid;
  }

  // ==========================
  // Check if user is authenticated
  // ==========================
  bool isAuthenticated() {
    return _firebaseAuth.currentUser != null;
  }

  // ==========================
  // Sign Out
  // ==========================
  Future<void> signOut() async {
    try {
      print('🚪 Signing out...');
      final SharedPreferences s = await SharedPreferences.getInstance();
      await s.clear();
      await _firebaseAuth.signOut();

      _isSignedIn = false;
      _uid = null;

      notifyListeners();
      print('✅ User signed out');
    } catch (e) {
      print('❌ Error signing out: $e');
    }
  }

  // ==========================
  // Refresh Auth State
  // ==========================
  Future<void> refreshAuthState() async {
    await _initializeAuth();
    notifyListeners();
  }
}

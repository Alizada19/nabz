import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/utils/utils.dart';
import 'package:nabz/features/home/presentation/pages/home_page.dart';
import 'package:nabz/features/user/presentation/pages/create_user_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EmailAuthProvider extends ChangeNotifier {
  // ==========================
  // Auth State
  // ==========================
  bool _isSignedIn = false;
  bool get isSignedIn => _isSignedIn;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _uid;
  String? get uid => _uid;

  // ==========================
  // Firebase Instances
  // ==========================
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;

  EmailAuthProvider() {
    _initializeAuth();
  }

  // ==========================
  // Initialization
  // ==========================
  Future<void> _initializeAuth() async {
    await checkSignIn();
  }

  // ==========================
  // Check Sign-in Status
  // ==========================
  Future<void> checkSignIn() async {
    try {
      final SharedPreferences s = await SharedPreferences.getInstance();
      final bool signedIn = s.getBool("is_signedin") ?? false;

      final User? currentUser = _firebaseAuth.currentUser;

      if (signedIn && currentUser != null) {
        _uid = currentUser.uid;
        _isSignedIn = true;
      } else if (currentUser != null) {
        _uid = currentUser.uid;
        _isSignedIn = true;
        await s.setBool("is_signedin", true);
      } else {
        _isSignedIn = false;
        _uid = null;
      }

      notifyListeners();
    } catch (e) {
      _isSignedIn = false;
      _uid = null;
      notifyListeners();
    }
  }

  // ==========================
  // SIGN UP (Email & Password)
  // ==========================
  Future<void> signUpWithEmail({
    required BuildContext context,
    required String email,
    required String password,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final UserCredential userCredential = await _firebaseAuth
          .createUserWithEmailAndPassword(
            email: email.trim(),
            password: password,
          );

      final User? user = userCredential.user;

      if (user != null) {
        _uid = user.uid;
        _isSignedIn = true;

        await _saveSession(user.uid);

        await _firebaseFirestore.collection("users").doc(user.uid).set({
          "uid": user.uid,
          "email": email.trim(),
          "createdAt": FieldValue.serverTimestamp(),
        });

        if (context.mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const CreateUserPage()),
            (route) => false,
          );
        }
      }

      _isLoading = false;
      notifyListeners();
    } on FirebaseAuthException catch (e) {
      _isLoading = false;
      notifyListeners();

      if (context.mounted) {
        showSnackbar(context, e.message ?? "Sign up failed");
      }
    }
  }

  // ==========================
  // SIGN IN (Email & Password)
  // ==========================
  Future<void> signInWithEmail({
    required BuildContext context,
    required String email,
    required String password,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final UserCredential userCredential = await _firebaseAuth
          .signInWithEmailAndPassword(email: email.trim(), password: password);

      final User? user = userCredential.user;

      if (user != null) {
        _uid = user.uid;
        _isSignedIn = true;

        await _saveSession(user.uid);

        final bool userExists = await checkExistingUser();

        if (context.mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  userExists ? const HomePage() : const CreateUserPage(),
            ),
            (route) => false,
          );
        }
      }

      _isLoading = false;
      notifyListeners();
    } on FirebaseAuthException catch (e) {
      _isLoading = false;
      notifyListeners();

      if (context.mounted) {
        showSnackbar(context, e.message ?? "Login failed");
      }
    }
  }

  // ==========================
  // Save session locally
  // ==========================
  Future<void> _saveSession(String uid) async {
    final SharedPreferences s = await SharedPreferences.getInstance();
    await s.setBool("is_signedin", true);
    await s.setString("uid", uid);
  }

  // ==========================
  // Check Firestore user
  // ==========================
  Future<bool> checkExistingUser() async {
    try {
      final String? uid = _firebaseAuth.currentUser?.uid;
      if (uid == null) return false;

      final snapshot = await _firebaseFirestore
          .collection("users")
          .doc(uid)
          .get();

      return snapshot.exists;
    } catch (e) {
      return false;
    }
  }

  // ==========================
  // Get UID
  // ==========================
  String? getCurrentUid() => _firebaseAuth.currentUser?.uid;

  bool isAuthenticated() => _firebaseAuth.currentUser != null;

  String? get userEmail => _firebaseAuth.currentUser?.email;

  // ==========================
  // SIGN OUT
  // ==========================
  Future<void> signOut() async {
    try {
      final SharedPreferences s = await SharedPreferences.getInstance();
      await s.clear();
      await _firebaseAuth.signOut();

      _isSignedIn = false;
      _uid = null;

      notifyListeners();
    } catch (e) {
      debugPrint("Sign out error: $e");
    }
  }

  // ==========================
  // Refresh
  // ==========================
  Future<void> refreshAuthState() async {
    await checkSignIn();
  }
}

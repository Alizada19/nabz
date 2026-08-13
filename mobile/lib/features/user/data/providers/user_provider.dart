import 'package:flutter/foundation.dart';
import 'package:nabz/features/user/data/models/user_model.dart';
import 'package:nabz/features/user/data/repositories/user_repository.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repository;

  UserProvider(this._repository);

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String _errorMessage = '';
  String get errorMessage => _errorMessage;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  // ==========================
  // Create user
  // ==========================
  Future<bool> createUser(UserModel user) async {
    _startOperation();
    try {
      await _repository.createUser(user);

      _currentUser = user;

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<UserModel?> fetchUserData() async {
    _startOperation();

    try {
      _currentUser = await _repository.getUser();

      notifyListeners();

      return _currentUser;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // ==========================
  // Update user
  // ==========================
  Future<bool> updateUser(UserModel user) async {
    _startOperation();

    try {
      await _repository.updateUser(user);

      _currentUser = user;
      notifyListeners();

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ==========================
  // Delete User
  // ==========================
  Future<bool> deleteUser() async {
    _startOperation();

    try {
      await _repository.deleteUser();

      _currentUser = null;
      notifyListeners();

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ==========================
  // State Helpers
  // ==========================
  void _startOperation() {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }
}

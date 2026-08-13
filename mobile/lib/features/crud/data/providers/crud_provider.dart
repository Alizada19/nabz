import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:nabz/features/crud/data/models/crud_model.dart';
import 'package:nabz/features/crud/data/repositories/crud_repository.dart';

class CrudProvider extends ChangeNotifier {
  final CrudRepository _repository;

  CrudProvider(this._repository) {
    _listenCrud();
  }

  StreamSubscription<List<CrudModel>>? _crudSubscription;

  List<CrudModel> _crud = [];
  List<CrudModel> get crud => _crud;

  List<CrudModel> _filteredCrud = [];
  List<CrudModel> get filteredCrud => _filteredCrud;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String _errorMessage = '';
  String get errorMessage => _errorMessage;

  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  @override
  void dispose() {
    _crudSubscription?.cancel();
    super.dispose();
  }

  void _listenCrud() {
    _crudSubscription = _repository.getCrudStream().listen(
      (data) {
        _crud = data;
        _applyFilter();

        notifyListeners();
      },
      onError: (error) {
        _setError(error.toString());
      },
    );
  }

  Future<bool> createCrud(String name, String position) async {
    _startOperation();

    try {
      await _repository.createCrud(name: name, position: position);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateCrud(String id, String name, String position) async {
    _startOperation();

    try {
      await _repository.updateCrud(id: id, name: name, position: position);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> deleteCrud(String id) async {
    _startOperation();

    try {
      await _repository.deleteCrud(id);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ==========================
  // Search
  // ==========================

  void searchCrud(String query) {
    _searchQuery = query.trim();
    _applyFilter();
    notifyListeners();
  }

  void clearSearch() {
    _searchQuery = '';
    _applyFilter();
    notifyListeners();
  }

  void _applyFilter() {
    final baseList = _crud;

    if (_searchQuery.isEmpty) {
      _filteredCrud = baseList;
      return;
    }

    final query = _searchQuery.toLowerCase().trim();

    _filteredCrud = baseList.where((item) {
      return item.name.toLowerCase().contains(query) ||
          item.position.toLowerCase().contains(query);
    }).toList();
  }

  // ==========================
  // Get By ID
  // ==========================

  CrudModel? getCrudById(String id) {
    try {
      return _crud.firstWhere((crud) => crud.id == id);
    } catch (_) {
      return null;
    }
  }

  // ==========================
  // Statistics
  // ==========================

  int get totalCount => _crud.length;

  int get filteredCount => _filteredCrud.length;

  // ==========================
  // State Helpers
  // ==========================

  void _startOperation() {
    _errorMessage = '';
    _setLoading(true);
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

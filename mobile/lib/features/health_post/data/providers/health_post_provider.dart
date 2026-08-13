import 'dart:developer';
import 'package:flutter/material.dart';
import '../models/health_post_model.dart';

class HealthPostProvider extends ChangeNotifier {
  List<HealthPostModel> _posts = [];
  bool _isLoading = false;
  String? _error;
  bool _showOnlyApproved = false;
  String _searchQuery = '';

  HealthPostProvider() {
    _loadSampleData();
  }

  // Getters
  List<HealthPostModel> get posts => _filteredPosts;
  List<HealthPostModel> get allPosts => _posts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get showOnlyApproved => _showOnlyApproved;
  String get searchQuery => _searchQuery;
  
  List<HealthPostModel> get _filteredPosts {
    var filtered = _posts;
    
    if (_showOnlyApproved) {
      filtered = filtered.where((post) => post.isApproved).toList();
    }
    
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((post) =>
        post.title.toLowerCase().contains(query) ||
        post.doctorFullName.toLowerCase().contains(query) ||
        post.doctorSpecialization.toLowerCase().contains(query)
      ).toList();
    }
    
    return filtered;
  }

  void _loadSampleData() {
    _posts = [
      HealthPostModel(
        id: '1',
        title: 'Blood Donation Camp',
        content: 'Join us for a blood donation camp at City Hospital.',
        doctorFullName: 'Dr. Ahmad Rahimi',
        doctorSpecialization: 'Hematologist',
        likes: 15,
        isApproved: true,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      HealthPostModel(
        id: '2',
        title: 'Importance of Blood Donation',
        content: 'Blood donation saves lives. One donation can save up to three lives.',
        doctorFullName: 'Dr. Fatima Karimi',
        doctorSpecialization: 'General Physician',
        likes: 8,
        isApproved: true,
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
      ),
      HealthPostModel(
        id: '3',
        title: 'Blood Types and Compatibility',
        content: 'Understanding blood types is crucial for safe transfusions.',
        doctorFullName: 'Dr. Mohsen Haidari',
        doctorSpecialization: 'Pathologist',
        likes: 22,
        isApproved: false,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      HealthPostModel(
        id: '4',
        title: 'Health Tips for Donors',
        content: 'Stay hydrated, eat iron-rich foods, and get good sleep.',
        doctorFullName: 'Dr. Sara Noori',
        doctorSpecialization: 'Nutritionist',
        likes: 5,
        isApproved: true,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
    ];
    notifyListeners();
  }

  // CREATE - This is the method name used in your code
  Future<void> createHealthPost(HealthPostModel post) async {
    _setLoading(true);
    _clearError();
    
    try {
      final newId = DateTime.now().millisecondsSinceEpoch.toString();
      final newPost = post.copyWith(
        id: newId,
        createdAt: DateTime.now(),
      );
      _posts.insert(0, newPost);
      _setLoading(false);
      notifyListeners();
      log('✅ Health post created: $newId');
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      log('❌ Error creating health post: $e');
    }
  }

  // READ - Load posts
  Future<void> loadPosts() async {
    _setLoading(true);
    _clearError();
    try {
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // UPDATE
  Future<void> updateHealthPost(String id, HealthPostModel updatedPost) async {
    _setLoading(true);
    _clearError();
    
    try {
      final index = _posts.indexWhere((post) => post.id == id);
      if (index != -1) {
        _posts[index] = updatedPost.copyWith(
          id: id,
          updatedAt: DateTime.now(),
        );
        _setLoading(false);
        notifyListeners();
        log('✅ Health post updated: $id');
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      log('❌ Error updating health post: $e');
    }
  }

  // DELETE
  Future<void> deleteHealthPost(String id) async {
    _setLoading(true);
    _clearError();
    
    try {
      _posts.removeWhere((post) => post.id == id);
      _setLoading(false);
      notifyListeners();
      log('✅ Health post deleted: $id');
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      log('❌ Error deleting health post: $e');
    }
  }

  // TOGGLE LIKE
  void toggleLike(String id) {
    final index = _posts.indexWhere((post) => post.id == id);
    if (index != -1) {
      _posts[index] = _posts[index].copyWith(
        likes: _posts[index].likes + 1,
      );
      notifyListeners();
    }
  }

  // TOGGLE APPROVAL
  void toggleApproval(String id) {
    final index = _posts.indexWhere((post) => post.id == id);
    if (index != -1) {
      _posts[index] = _posts[index].copyWith(
        isApproved: !_posts[index].isApproved,
      );
      notifyListeners();
    }
  }

  // Set filter
  void setShowOnlyApproved(bool value) {
    _showOnlyApproved = value;
    notifyListeners();
  }

  // Set search query
  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Reset to sample data
  void resetToSampleData() {
    _loadSampleData();
  }

  // Private helpers
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }
}
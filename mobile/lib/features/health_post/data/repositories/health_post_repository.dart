import 'dart:developer';
import '../models/health_post_model.dart';
import '../providers/health_post_provider.dart';

class HealthPostRepository {
  final HealthPostProvider _provider;

  HealthPostRepository(this._provider);

  // CREATE
  Future<void> createHealthPost(HealthPostModel post) async {
    try {
      await _provider.createHealthPost(post);
    } catch (e) {
      log('❌ Repository - Create error: $e');
      rethrow;
    }
  }

  // READ - Get all posts
  Future<List<HealthPostModel>> getHealthPosts() async {
    try {
      return _provider.allPosts;
    } catch (e) {
      log('❌ Repository - Get all error: $e');
      rethrow;
    }
  }

  // UPDATE
  Future<void> updateHealthPost(String id, HealthPostModel post) async {
    try {
      await _provider.updateHealthPost(id, post);
    } catch (e) {
      log('❌ Repository - Update error: $e');
      rethrow;
    }
  }

  // DELETE
  Future<void> deleteHealthPost(String id) async {
    try {
      await _provider.deleteHealthPost(id);
    } catch (e) {
      log('❌ Repository - Delete error: $e');
      rethrow;
    }
  }

  // TOGGLE LIKE
  void toggleLike(String id) {
    try {
      _provider.toggleLike(id);
    } catch (e) {
      log('❌ Repository - Toggle like error: $e');
      rethrow;
    }
  }

  // TOGGLE APPROVAL
  void toggleApproval(String id) {
    try {
      _provider.toggleApproval(id);
    } catch (e) {
      log('❌ Repository - Toggle approval error: $e');
      rethrow;
    }
  }

  // Reset to sample data
  void resetToSampleData() {
    _provider.resetToSampleData();
  }
}
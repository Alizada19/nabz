import 'package:flutter/material.dart';
import 'data/repositories/health_post_repository.dart';
import 'presentation/pages/health_post_list_page.dart';

class HealthPostModule {
  static final HealthPostRepository _repository = HealthPostRepository();

  static Widget getListPage() {
    return const HealthPostListPage();
  }

  // For dependency injection if needed
  static HealthPostRepository getRepository() {
    return _repository;
  }
}
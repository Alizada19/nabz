import 'package:flutter/material.dart';
import 'package:nabz/features/donation/presentation/pages/donation_page.dart';
import 'package:nabz/features/request/presentation/pages/request_page.dart';
import 'package:nabz/features/crud/presentation/pages/crud_page.dart';
import 'package:nabz/features/home/presentation/pages/home_page.dart';
import 'package:nabz/features/navigation/presentation/pages/navigation_page.dart';

class AppRoutes {
  static final pages = {
    '/': (context) => NavigationPage(),
    '/home': (context) => HomePage(),
    '/donation': (context) => DonationPage(),
    '/request': (context) => RequestPage(),
    '/crud': (context) => CrudPage(),
  };

  static const navigation = '/';
  static const home = '/home';
  static const donation = '/donation';
  static const request = '/request';
  static const crud = '/crud';
}
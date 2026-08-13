import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/features/crud/presentation/pages/crud_page.dart';
import 'package:nabz/features/donation/presentation/pages/donation_page.dart';
import 'package:nabz/features/home/presentation/pages/home_page.dart';
import 'package:nabz/features/request/presentation/pages/request_page.dart';
import 'package:nabz/features/health_post/presentation/pages/health_post_list_page.dart';
import 'package:nabz/features/navigation/presentation/widgets/bottom_navigation.dart';

class NavigationPage extends StatefulWidget {
  const NavigationPage({super.key});

  @override
  State<NavigationPage> createState() => _NavigationPageState();
}

class _NavigationPageState extends State<NavigationPage> {
  Menus currentIndex = Menus.home;

  // 5 tabs: Home, Donation, Request, Health Posts, CRUD
  final pages = [
    const HomePage(),
    const DonationPage(),
    const RequestPage(),
    const HealthPostListPage(), // Health Posts
    const CrudPage(), // Keep CRUD
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: pages[currentIndex.index],
      bottomNavigationBar: MyBottomNavigation(
        currentIndex: currentIndex,
        onTap: (value) {
          setState(() {
            currentIndex = value;
          });
        },
      ),
    );
  }
}

// 5 items in enum
enum Menus { home, donation, request, healthPosts, crud }

class MyBottomNavigation extends StatelessWidget {
  final Menus currentIndex;
  final ValueChanged<Menus> onTap;

  const MyBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: BottomNavigation(
              onPressed: () => onTap(Menus.home),
              icon: const Icon(Icons.home_outlined),
              current: currentIndex,
              name: Menus.home,
              label: 'home'.tr(),
            ),
          ),
          Expanded(
            child: BottomNavigation(
              onPressed: () => onTap(Menus.donation),
              icon: const Icon(Icons.bloodtype_outlined),
              current: currentIndex,
              name: Menus.donation,
              label: 'donation'.tr(),
            ),
          ),
          Expanded(
            child: BottomNavigation(
              onPressed: () => onTap(Menus.request),
              icon: const Icon(Icons.emergency_outlined),
              current: currentIndex,
              name: Menus.request,
              label: 'request'.tr(),
            ),
          ),
          Expanded(
            child: BottomNavigation(
              onPressed: () => onTap(Menus.healthPosts),
              icon: const Icon(Icons.medical_services_outlined),
              current: currentIndex,
              name: Menus.healthPosts,
              label: 'health_posts'.tr(),
            ),
          ),
          Expanded(
            child: BottomNavigation(
              onPressed: () => onTap(Menus.crud),
              icon: const Icon(Icons.help_outlined),
              current: currentIndex,
              name: Menus.crud,
              label: 'demo'.tr(),
            ),
          ),
        ],
      ),
    );
  }
}
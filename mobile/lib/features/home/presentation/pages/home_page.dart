import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/constants/app_colors.dart';
import 'package:nabz/features/home/presentation/widgets/childs/advertisement.dart';
import 'package:nabz/features/home/presentation/widgets/childs/health_tips.dart';
import 'package:nabz/features/home/presentation/widgets/childs/home_buttons.dart';
import 'package:nabz/features/home/presentation/widgets/childs/recent_bloo_request.dart';
import 'package:nabz/features/home/presentation/widgets/custom_app_bar.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      appBar: CustomAppBar(
        title: 'home'.tr(),
        backgroundColor: AppColors.accent,
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HomeButtons(),
            const SizedBox(height: 25),
            Advertisement(),
            const SizedBox(height: 25),
            HealthTips(),
            const SizedBox(height: 25),

            RecentBlooRequest(),
            const SizedBox(height: 90),
          ],
        ),
      ),
    );
  }
}

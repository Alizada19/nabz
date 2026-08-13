import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:nabz/core/constants/app_routes.dart';
import 'package:nabz/core/theme/app_theme.dart';
import 'package:nabz/features/auth/email/data/provider/email_auth_provider.dart';
import 'package:nabz/features/crud/data/providers/crud_provider.dart';
import 'package:nabz/features/crud/data/repositories/crud_repository.dart';
import 'package:nabz/features/health_post/data/providers/health_post_provider.dart';
import 'package:nabz/features/user/data/providers/user_provider.dart';
import 'package:nabz/features/user/data/repositories/user_repository.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('fa'), Locale('ps')],
      path: 'assets/localization',
      fallbackLocale: const Locale('fa'),
      startLocale: const Locale('fa'),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Repositories
        Provider<UserRepository>(create: (_) => UserRepository()),
        Provider<CrudRepository>(create: (_) => CrudRepository()),

        // Auth provider
        ChangeNotifierProvider<EmailAuthProvider>(
          create: (_) => EmailAuthProvider(),
          lazy: false,
        ),

        // User provider
        ChangeNotifierProvider<UserProvider>(
          create: (context) => UserProvider(context.read<UserRepository>()),
          lazy: false,
        ),

        // CRUD provider
        ChangeNotifierProvider<CrudProvider>(
          create: (context) => CrudProvider(context.read<CrudRepository>()),
        ),

        // Health Post provider - Simple in-memory CRUD
        ChangeNotifierProvider<HealthPostProvider>(
          create: (_) => HealthPostProvider(),
        ),
      ],
      child: Builder(
        builder: (context) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: "Nabz - Blood Donation App",
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,

            localizationsDelegates: context.localizationDelegates,
            supportedLocales: context.supportedLocales,
            locale: context.locale,

            initialRoute: AppRoutes.navigation,
            routes: AppRoutes.pages,
          );
        },
      ),
    );
  }
}
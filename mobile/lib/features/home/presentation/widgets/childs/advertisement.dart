import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class Advertisement extends StatelessWidget {
  const Advertisement({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      padding: const EdgeInsets.all(20),

      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),

        gradient: const LinearGradient(
          colors: [
            Color.fromARGB(255, 215, 232, 235),
            Color.fromARGB(255, 207, 222, 233),
          ],
        ),
      ),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'sponsored'.tr(),
            style: TextStyle(
              color: Colors.deepPurple,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 10),

          Text(
            'hospital'.tr(),
            style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
          ),

          Text(
            'service'.tr(),
            style: TextStyle(
              fontSize: 18,
              color: Colors.deepPurple,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 10),

          Text('address'.tr(), style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

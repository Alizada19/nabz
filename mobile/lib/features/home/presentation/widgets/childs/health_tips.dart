import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class HealthTips extends StatelessWidget {
  const HealthTips({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,

      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.medical_services,
                    color: Colors.red.shade700,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'health_tips'.tr(),
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A2E),
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: () {
                // Navigate to all requests
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.red.shade200, width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'view_all'.tr(),
                      style: TextStyle(
                        color: Colors.red.shade700,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.red.shade700,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 15),

        SizedBox(
          height: 250,

          child: ListView(
            scrollDirection: Axis.horizontal,

            children: const [
              PostCard(
                tag: "You're a Healthy Adult",
                title:
                    "No current illness or infection Feeling well on the day of donation",
              ),

              PostCard(
                tag: "You Have No Major Surgeries Recently",
                title:
                    "Minor procedures: Wait 3 days Major surgeries: Wait 6 months",
              ),

              PostCard(
                tag: "Your Travel History is Clean",
                title:
                    "No travel to malaria-risk areas in the last 3 months Naffected areas in the last 28 days",
              ),

              PostCard(
                tag: "You're Not Pregnant",
                title:
                    "Pregnant women cannot donate Wait 6 months after delivery Wait 6 months after miscarriage",
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PostCard extends StatelessWidget {
  final String title;
  final String tag;

  const PostCard({super.key, required this.title, required this.tag});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,

      margin: const EdgeInsets.only(right: 15),

      padding: const EdgeInsets.all(15),

      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(
          colors: [
            Color.fromARGB(255, 215, 232, 235),
            Color.fromARGB(255, 207, 222, 233),
          ],
        ),
        color: Colors.white,

        boxShadow: [BoxShadow(blurRadius: 8, color: Colors.grey.shade300)],
      ),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,

        children: [
          Container(
            height: 100,

            decoration: BoxDecoration(
              color: Colors.red.shade100,

              borderRadius: BorderRadius.circular(12),
            ),
          ),

          const SizedBox(height: 10),

          Text(
            tag,

            style: const TextStyle(
              fontSize: 13,
              color: Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),

          Text(
            title,

            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.normal),
          ),
        ],
      ),
    );
  }
}

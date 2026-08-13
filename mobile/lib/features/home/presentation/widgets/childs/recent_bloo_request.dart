import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class RecentBlooRequest extends StatelessWidget {
  const RecentBlooRequest({super.key});

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
                    Icons.bloodtype,
                    color: Colors.red.shade700,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'recent_blood_requests'.tr(),
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
        const Column(
          children: [
            RequestCard(
              bloodType: "O- (Negative)",
              units: "2 Units",
              urgency: "Urgent",
              hospital: "City Hospital",
              location: "Kabul, Afghanistan",
              isUrgent: true,
              time: "15 min ago",
              distance: "2.3 km",
              donorCount: 3,
              patientName: "Ahmad R.",
              patientAge: 45,
              patientGender: "Male",
            ),
            RequestCard(
              bloodType: "A+ (Positive)",
              units: "3 Units",
              urgency: "Urgent",
              hospital: "Hope Medical Center",
              location: "Herat, Afghanistan",
              isUrgent: true,
              time: "1 hour ago",
              distance: "5.7 km",
              donorCount: 1,
              patientName: "Fatima H.",
              patientAge: 32,
              patientGender: "Female",
            ),
            RequestCard(
              bloodType: "B- (Negative)",
              units: "1 Unit",
              urgency: "Normal",
              hospital: "Life Care Hospital",
              location: "Mazar-i-Sharif, Afghanistan",
              isUrgent: false,
              time: "3 hours ago",
              distance: "8.1 km",
              donorCount: 0,
              patientName: "Mohammad K.",
              patientAge: 28,
              patientGender: "Male",
            ),
            RequestCard(
              bloodType: "AB+ (Positive)",
              units: "2 Units",
              urgency: "Urgent",
              hospital: "Kandahar Medical Hospital",
              location: "Kandahar, Afghanistan",
              isUrgent: true,
              time: "5 hours ago",
              distance: "12.4 km",
              donorCount: 2,
              patientName: "Zahra N.",
              patientAge: 67,
              patientGender: "Female",
            ),
            RequestCard(
              bloodType: "O+ (Positive)",
              units: "4 Units",
              urgency: "Normal",
              hospital: "Balkh Provincial Hospital",
              location: "Balkh, Afghanistan",
              isUrgent: false,
              time: "1 day ago",
              distance: "15.8 km",
              donorCount: 0,
              patientName: "Ali R.",
              patientAge: 52,
              patientGender: "Male",
            ),
          ],
        ),
      ],
    );
  }
}

class RequestCard extends StatelessWidget {
  final String bloodType;
  final String units;
  final String urgency;
  final String hospital;
  final String location;
  final bool isUrgent;
  final String time;
  final String distance;
  final int donorCount;
  final String patientName;
  final int patientAge;
  final String patientGender;

  const RequestCard({
    super.key,
    required this.bloodType,
    required this.units,
    required this.urgency,
    required this.hospital,
    required this.location,
    required this.isUrgent,
    required this.time,
    required this.distance,
    required this.donorCount,
    required this.patientName,
    required this.patientAge,
    required this.patientGender,
  });

  Color get urgencyColor => isUrgent ? Colors.red : Colors.orange;
  Color get bgColor => isUrgent ? Colors.red.shade50 : Colors.grey.shade50;
  Color get borderColor =>
      isUrgent ? Colors.red.shade200 : Colors.grey.shade200;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Navigate to request details
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1.5),
          color: bgColor,
          boxShadow: [
            BoxShadow(
              color: isUrgent
                  ? Colors.red.shade100.withOpacity(0.3)
                  : Colors.grey.shade200.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Blood type and icon - Fixed width
            SizedBox(
              width: 60,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: isUrgent
                            ? [Colors.red.shade400, Colors.red.shade700]
                            : [Colors.grey.shade400, Colors.grey.shade600],
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: isUrgent
                              ? Colors.red.shade300.withOpacity(0.4)
                              : Colors.grey.shade300.withOpacity(0.4),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.bloodtype,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    units,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isUrgent
                          ? Colors.red.shade700
                          : Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Details - Expanded to take remaining space
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Blood type and urgency badge
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          bloodType,
                          style: TextStyle(
                            color: isUrgent
                                ? Colors.red.shade700
                                : Colors.black87,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: isUrgent
                              ? Colors.red.shade600
                              : Colors.grey.shade500,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isUrgent ? "URGENT" : "NORMAL",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                      const Spacer(),
                      // Donor count - Smaller
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: isUrgent
                              ? Colors.red.shade200.withOpacity(0.5)
                              : Colors.grey.shade300.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.people,
                              size: 10,
                              color: isUrgent
                                  ? Colors.red.shade700
                                  : Colors.grey.shade700,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              "$donorCount",
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                color: isUrgent
                                    ? Colors.red.shade700
                                    : Colors.grey.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  // Patient info
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline,
                        size: 12,
                        color: Colors.grey.shade600,
                      ),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          "$patientName • $patientAge ${patientGender == 'Male' ? '♂' : '♀'}",
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  // Hospital and location
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 12,
                        color: isUrgent
                            ? Colors.red.shade400
                            : Colors.grey.shade500,
                      ),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          "$hospital • $location",
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  // Time and distance
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 10,
                        color: isUrgent
                            ? Colors.red.shade400
                            : Colors.grey.shade500,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        time,
                        style: TextStyle(
                          fontSize: 10,
                          color: isUrgent
                              ? Colors.red.shade600
                              : Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 3,
                        height: 3,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade400,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.near_me,
                        size: 10,
                        color: isUrgent
                            ? Colors.red.shade400
                            : Colors.grey.shade500,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        distance,
                        style: TextStyle(
                          fontSize: 10,
                          color: isUrgent
                              ? Colors.red.shade600
                              : Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Action button - Fixed width
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isUrgent
                      ? [Colors.red.shade400, Colors.red.shade700]
                      : [Colors.grey.shade400, Colors.grey.shade600],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.volunteer_activism, color: Colors.white, size: 16),
                  SizedBox(height: 2),
                  Text(
                    "Help",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

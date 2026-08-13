import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String fullName;
  final String gender;
  final String province;
  final String bloodGroop;
  final Timestamp? dateOfBirth;
  final String? email;
  final String? phoneNumber;
  final bool hidePhoneNumber;
  final Timestamp? lastDonationDate;
  final GeoPoint? location;
  final int? weight;
  final String uid;
  final Timestamp createdAt;

  UserModel({
    required this.fullName,
    required this.gender,
    required this.province,
    required this.bloodGroop,
    this.dateOfBirth,
    this.email,
    this.phoneNumber,
    required this.hidePhoneNumber,
    this.lastDonationDate,
    this.location,
    this.weight,
    required this.uid,
    required this.createdAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      fullName: map['fullName'] ?? '',
      gender: map['gender'] ?? '',
      province: map['province'] ?? '',
      bloodGroop: map['bloodGroop'] ?? '',
      dateOfBirth: map['dateOfBirth'] as Timestamp?,
      email: map['email'] as String?,
      phoneNumber: map['phoneNumber'] as String?,
      hidePhoneNumber: map['hidePhoneNumber'] ?? false,
      lastDonationDate: map['lastDonationDate'] as Timestamp?,
      location: map['location'] as GeoPoint?,
      weight: map['weight'] as int?,
      uid: map['uid'] ?? '',
      createdAt: map['createdAt'] as Timestamp? ?? Timestamp.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      "fullName": fullName,
      "gender": gender,
      "province": province,
      "bloodGroop": bloodGroop,
      "dateOfBirth": dateOfBirth,
      "email": email,
      "phoneNumber": phoneNumber,
      "hidePhoneNumber": hidePhoneNumber,
      "lastDonationDate": lastDonationDate,
      "location": location,
      "weight": weight,
      "uid": uid,
      "createdAt": createdAt,
    };
  }

  UserModel copyWith({
    String? fullName,
    String? gender,
    String? province,
    String? bloodGroop,
    Timestamp? dateOfBirth,
    String? email,
    String? phoneNumber,
    bool? hidePhoneNumber,
    Timestamp? lastDonationDate,
    GeoPoint? location,
    int? weight,
    String? uid,
    Timestamp? createdAt,
  }) {
    return UserModel(
      fullName: fullName ?? this.fullName,
      gender: gender ?? this.gender,
      province: province ?? this.province,
      bloodGroop: bloodGroop ?? this.bloodGroop,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      hidePhoneNumber: hidePhoneNumber ?? this.hidePhoneNumber,
      lastDonationDate: lastDonationDate ?? this.lastDonationDate,
      location: location ?? this.location,
      weight: weight ?? this.weight,
      uid: uid ?? this.uid,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

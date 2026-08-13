class HealthPostModel {
  final String? id;
  final String title;
  final String content;
  final String doctorFullName;
  final String doctorSpecialization;
  final int likes;
  final bool isApproved;
  final DateTime createdAt;
  final DateTime? updatedAt;

  HealthPostModel({
    this.id,
    required this.title,
    required this.content,
    required this.doctorFullName,
    required this.doctorSpecialization,
    this.likes = 0,
    this.isApproved = false,
    required this.createdAt,
    this.updatedAt,
  });

  // Create a copy with updated fields
  HealthPostModel copyWith({
    String? id,
    String? title,
    String? content,
    String? doctorFullName,
    String? doctorSpecialization,
    int? likes,
    bool? isApproved,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return HealthPostModel(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      doctorFullName: doctorFullName ?? this.doctorFullName,
      doctorSpecialization: doctorSpecialization ?? this.doctorSpecialization,
      likes: likes ?? this.likes,
      isApproved: isApproved ?? this.isApproved,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // For JSON serialization (if needed later)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'doctorFullName': doctorFullName,
      'doctorSpecialization': doctorSpecialization,
      'likes': likes,
      'isApproved': isApproved,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  factory HealthPostModel.fromJson(Map<String, dynamic> json) {
    return HealthPostModel(
      id: json['id'],
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      doctorFullName: json['doctorFullName'] ?? '',
      doctorSpecialization: json['doctorSpecialization'] ?? '',
      likes: json['likes'] ?? 0,
      isApproved: json['isApproved'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }
}
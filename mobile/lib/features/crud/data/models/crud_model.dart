import 'package:cloud_firestore/cloud_firestore.dart';

class CrudModel {
  final String id;
  final String name;
  final String position;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CrudModel({
    required this.id,
    required this.name,
    required this.position,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CrudModel.fromMap(Map<String, dynamic> map, String id) {
    return CrudModel(
      id: id,
      name: map['name'] ?? '',
      position: map['position'] ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  factory CrudModel.fromFirestore(DocumentSnapshot doc) {
    return CrudModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
  }

  /// Used for update operations
  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'position': position,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  /// Used when creating a document
  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'position': position,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  CrudModel copyWith({
    String? id,
    String? name,
    String? position,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CrudModel(
      id: id ?? this.id,
      name: name ?? this.name,
      position: position ?? this.position,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';

class UserRepository {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  UserRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
    : _firestore = firestore ?? FirebaseFirestore.instance,
      _auth = auth ?? FirebaseAuth.instance;

  CollectionReference<Map<String, dynamic>> get _usersCollection =>
      _firestore.collection('users');

  String? get currentUid => _auth.currentUser?.uid;

  Future<void> createUser(UserModel user) async {
    final uid = currentUid;

    if (uid == null) {
      throw Exception('User not authenticated');
    }

    await _usersCollection.doc(uid).set(user.toMap());
  }

  Future<UserModel?> getUser() async {
    final uid = currentUid;

    if (uid == null) {
      throw Exception('User not authenticated');
    }

    final doc = await _usersCollection.doc(uid).get();

    if (!doc.exists) return null;

    return UserModel.fromMap(doc.data()!);
  }

  Future<void> updateUser(UserModel user) async {
    final uid = currentUid;

    if (uid == null) {
      throw Exception('User not authenticated');
    }

    await _usersCollection.doc(uid).update(user.toMap());
  }

  Future<void> updateFields(Map<String, dynamic> updates) async {
    final uid = currentUid;

    if (uid == null) {
      throw Exception('User not authenticated');
    }

    await _usersCollection.doc(uid).update(updates);
  }

  Future<void> deleteUser() async {
    final uid = currentUid;

    if (uid == null) {
      throw Exception('User not authenticated');
    }

    await _usersCollection.doc(uid).delete();
  }

  Stream<UserModel?> userStream() {
    final uid = currentUid;

    if (uid == null) {
      return Stream.value(null);
    }

    return _usersCollection.doc(uid).snapshots().map((doc) {
      if (!doc.exists) return null;

      return UserModel.fromMap(doc.data()!);
    });
  }
}

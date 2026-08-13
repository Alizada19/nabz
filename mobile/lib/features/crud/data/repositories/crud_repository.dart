import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nabz/features/crud/data/models/crud_model.dart';

class CrudRepository {
  final FirebaseFirestore _firestore;

  CrudRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _crudCollection =>
      _firestore.collection('crud');

  Stream<List<CrudModel>> getCrudStream() {
    return _crudCollection
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map(CrudModel.fromFirestore).toList());
  }

  Future<void> createCrud({
    required String name,
    required String position,
  }) async {
    final crud = CrudModel(
      id: '',
      name: name.trim(),
      position: position.trim(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await _crudCollection.add(crud.toFirestore());
  }

  Future<void> updateCrud({
    required String id,
    required String name,
    required String position,
  }) async {
    await _crudCollection.doc(id).update({
      'name': name.trim(),
      'position': position.trim(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> deleteCrud(String id) async {
    await _crudCollection.doc(id).delete();
  }

  Future<CrudModel?> getCrud(String id) async {
    final doc = await _crudCollection.doc(id).get();

    if (!doc.exists) return null;

    return CrudModel.fromFirestore(doc);
  }
}

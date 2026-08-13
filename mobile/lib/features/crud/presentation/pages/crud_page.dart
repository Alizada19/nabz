import 'package:flutter/material.dart';
import 'package:nabz/features/crud/data/models/crud_model.dart';
import 'package:nabz/features/crud/data/providers/crud_provider.dart';
import 'package:provider/provider.dart';
import 'package:nabz/features/common/presentation/widgets/custom_app_bar_with_search.dart';
import 'package:nabz/features/crud/presentation/widgets/form_dialog.dart';
import 'package:nabz/features/crud/presentation/widgets/remove_dialog.dart';

class CrudPage extends StatefulWidget {
  const CrudPage({super.key});

  @override
  State<CrudPage> createState() => _CrudPageState();
}

class _CrudPageState extends State<CrudPage> {
  final TextEditingController _searchController = TextEditingController();

  String searchText = '';
  bool isSearchClick = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: CustomAppBarWithSearch(
        title: 'Crud',
        showSearch: true,
        isSearchClicked: isSearchClick,
        searchController: _searchController,
        backgroundColor: theme.colorScheme.secondary,
        searchHintText: "Search by name...",

        onSearchToggle: (value) {
          setState(() {
            isSearchClick = value;
            if (!value) {
              _searchController.clear();
              searchText = '';
              context.read<CrudProvider>().clearSearch();
            }
          });
        },

        onSearchChanged: (value) {
          setState(() {
            searchText = value;
          });
          context.read<CrudProvider>().searchCrud(value);
        },
      ),

      body: Consumer<CrudProvider>(
        builder: (context, provider, child) {
          final items = provider.filteredCrud;

          if (provider.isLoading && items.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (items.isEmpty) {
            return Center(
              child: Text(
                searchText.isEmpty ? 'No Crud Yet' : 'No Results Found',
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              // stream auto-updates, so just delay UX
              await Future.delayed(const Duration(milliseconds: 500));
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final crud = items[index];

                return Card(
                  child: ListTile(
                    title: Text(crud.name),
                    subtitle: Text(crud.position),

                    onLongPress: () {
                      _showOptionsMenu(context, crud);
                    },

                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () => _editCrud(context, crud),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () => _deleteCrud(context, crud),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),

      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 60),
        child: FloatingActionButton(
          onPressed: () => _createCrud(context),
          child: const Icon(Icons.add),
        ),
      ),
    );
  }

  void _createCrud(BuildContext context) {
    showDialog(context: context, builder: (_) => const FormDialog());
  }

  void _editCrud(BuildContext context, CrudModel crud) {
    showDialog(
      context: context,
      builder: (_) => FormDialog(crud: crud),
    );
  }

  void _deleteCrud(BuildContext context, CrudModel crud) {
    showDialog(
      context: context,
      builder: (_) => RemoveDialog(documentId: crud.id, itemName: crud.name),
    );
  }

  void _showOptionsMenu(BuildContext context, CrudModel crud) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('Edit'),
            onTap: () {
              Navigator.pop(context);
              _editCrud(context, crud);
            },
          ),
          ListTile(
            leading: const Icon(Icons.delete),
            title: const Text('Delete'),
            onTap: () {
              Navigator.pop(context);
              _deleteCrud(context, crud);
            },
          ),
        ],
      ),
    );
  }
}

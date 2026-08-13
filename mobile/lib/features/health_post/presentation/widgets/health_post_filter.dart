import 'package:flutter/material.dart';

class HealthPostFilter extends StatelessWidget {
  final bool showOnlyApproved;
  final String searchQuery;
  final ValueChanged<bool> onFilterChanged;
  final ValueChanged<String> onSearchChanged;

  const HealthPostFilter({
    Key? key,
    required this.showOnlyApproved,
    required this.searchQuery,
    required this.onFilterChanged,
    required this.onSearchChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Search
          TextField(
            decoration: InputDecoration(
              hintText: 'Search by title or doctor...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              filled: true,
              fillColor: Colors.grey.shade100,
              suffixIcon: searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () => onSearchChanged(''),
                    )
                  : null,
            ),
            onChanged: onSearchChanged,
          ),
          const SizedBox(height: 12),
          // Filter
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('Show only approved posts'),
                  const SizedBox(width: 8),
                  Switch(
                    value: showOnlyApproved,
                    onChanged: onFilterChanged,
                    activeColor: Colors.red.shade700,
                  ),
                ],
              ),
              if (showOnlyApproved)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Filtered',
                    style: TextStyle(
                      color: Colors.green.shade700,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
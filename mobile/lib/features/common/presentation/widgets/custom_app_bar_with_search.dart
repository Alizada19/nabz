import 'package:flutter/material.dart';

class CustomAppBarWithSearch extends StatelessWidget
    implements PreferredSizeWidget {
  final String title;
  final bool showSearch;
  final bool isSearchClicked;
  final ValueChanged<bool>? onSearchToggle;
  final ValueChanged<String>? onSearchChanged;
  final TextEditingController? searchController;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final Color? titleColor;
  final String? searchHintText;

  const CustomAppBarWithSearch({
    super.key,
    required this.title,
    this.showSearch = false,
    this.isSearchClicked = false,
    this.onSearchToggle,
    this.onSearchChanged,
    this.searchController,
    this.actions,
    this.backgroundColor,
    this.titleColor,
    this.searchHintText = "Search...",
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bgColor = backgroundColor ?? theme.colorScheme.secondary;
    final titleClr = titleColor ?? Colors.white;

    return AppBar(
      centerTitle: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      title: isSearchClicked && showSearch
          ? Container(
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const SizedBox(width: 16),
                  Icon(Icons.search_rounded, size: 22, color: bgColor),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      onChanged: onSearchChanged,
                      controller: searchController,
                      autofocus: true,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                      decoration: InputDecoration(
                        hintText: searchHintText,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        errorBorder: InputBorder.none,
                        focusedErrorBorder: InputBorder.none,
                        hintStyle: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 15,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 14,
                        ),
                      ),
                    ),
                  ),
                  if (searchController != null &&
                      searchController!.text.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        searchController?.clear();
                        onSearchChanged?.call('');
                      },
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.close,
                          size: 18,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                  const SizedBox(width: 12),
                ],
              ),
            )
          : Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 22,
                color: titleClr,
                letterSpacing: 0.5,
              ),
            ),
      leading: isSearchClicked && showSearch
          ? IconButton(
              onPressed: () {
                searchController?.clear();
                onSearchChanged?.call('');
                onSearchToggle?.call(false);
              },
              icon: const Icon(
                Icons.arrow_back_ios,
                color: Colors.white,
                size: 20,
              ),
              tooltip: 'Back',
            )
          : null,
      actions: isSearchClicked && showSearch
          ? [
              TextButton(
                onPressed: () {
                  searchController?.clear();
                  onSearchChanged?.call('');
                  onSearchToggle?.call(false);
                },
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                child: const Text('Cancel'),
              ),
            ]
          : (actions ??
                [
                  if (showSearch)
                    Container(
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        onPressed: () {
                          onSearchToggle?.call(!isSearchClicked);
                        },
                        icon: Icon(
                          isSearchClicked ? Icons.close : Icons.search,
                          color: Colors.white,
                          size: 22,
                        ),
                        tooltip: isSearchClicked ? 'Close search' : 'Search',
                      ),
                    ),
                ]),
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [bgColor, bgColor.withValues(alpha: 0.9), bgColor],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            stops: const [0, 0.5, 1],
          ),
        ),
      ),
      bottom: isSearchClicked && showSearch
          ? PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                height: 1,
                color: Colors.white.withValues(alpha: 0.2),
              ),
            )
          : null,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

import 'package:flutter/material.dart';

/// LearnLoop デザインシステム - カラーパレット
/// v0のデザイントークンをFlutter用に変換
abstract final class AppColors {
  // ===== Primary =====
  static const primary = Color(0xFF6366F1); // Indigo-500
  static const primaryForeground = Colors.white;

  // ===== Semantic Colors =====
  static const success = Color(0xFF22C55E); // Green-500
  static const successForeground = Colors.white;
  static const error = Color(0xFFEF4444); // Red-500
  static const errorForeground = Colors.white;

  // ===== Accent =====
  static const accent = Color(0xFFA855F7); // Purple-500
  static const streak = Color(0xFFF97316); // Orange-500

  // ===== Light Theme =====
  static const lightBackground = Color(0xFFFAFAFA);
  static const lightForeground = Color(0xFF171717);
  static const lightCard = Colors.white;
  static const lightCardForeground = Color(0xFF171717);
  static const lightBorder = Color(0xFFE5E5E5);
  static const lightMuted = Color(0xFFF5F5F5);
  static const lightMutedForeground = Color(0xFF737373);

  // ===== Dark Theme =====
  static const darkBackground = Color(0xFF171717);
  static const darkForeground = Color(0xFFFAFAFA);
  static const darkCard = Color(0xFF262626);
  static const darkCardForeground = Color(0xFFFAFAFA);
  static const darkBorder = Color(0xFF404040);
  static const darkMuted = Color(0xFF262626);
  static const darkMutedForeground = Color(0xFFA3A3A3);

  // ===== Gradients =====
  static const primaryGradient = LinearGradient(
    colors: [primary, accent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const successGradient = LinearGradient(
    colors: [success, Color(0xFF4ADE80)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

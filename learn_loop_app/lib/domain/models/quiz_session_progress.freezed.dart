// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quiz_session_progress.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuizSessionProgress {

/// セッション開始日の深夜0時の millisecondsSinceEpoch
 int get sessionDateMs;/// 残り問題数（セッション開始時の出題数から nextQuestion() のたびに減る）
 int get remaining;
/// Create a copy of QuizSessionProgress
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizSessionProgressCopyWith<QuizSessionProgress> get copyWith => _$QuizSessionProgressCopyWithImpl<QuizSessionProgress>(this as QuizSessionProgress, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizSessionProgress&&(identical(other.sessionDateMs, sessionDateMs) || other.sessionDateMs == sessionDateMs)&&(identical(other.remaining, remaining) || other.remaining == remaining));
}


@override
int get hashCode => Object.hash(runtimeType,sessionDateMs,remaining);

@override
String toString() {
  return 'QuizSessionProgress(sessionDateMs: $sessionDateMs, remaining: $remaining)';
}


}

/// @nodoc
abstract mixin class $QuizSessionProgressCopyWith<$Res>  {
  factory $QuizSessionProgressCopyWith(QuizSessionProgress value, $Res Function(QuizSessionProgress) _then) = _$QuizSessionProgressCopyWithImpl;
@useResult
$Res call({
 int sessionDateMs, int remaining
});




}
/// @nodoc
class _$QuizSessionProgressCopyWithImpl<$Res>
    implements $QuizSessionProgressCopyWith<$Res> {
  _$QuizSessionProgressCopyWithImpl(this._self, this._then);

  final QuizSessionProgress _self;
  final $Res Function(QuizSessionProgress) _then;

/// Create a copy of QuizSessionProgress
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? sessionDateMs = null,Object? remaining = null,}) {
  return _then(_self.copyWith(
sessionDateMs: null == sessionDateMs ? _self.sessionDateMs : sessionDateMs // ignore: cast_nullable_to_non_nullable
as int,remaining: null == remaining ? _self.remaining : remaining // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [QuizSessionProgress].
extension QuizSessionProgressPatterns on QuizSessionProgress {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuizSessionProgress value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuizSessionProgress() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuizSessionProgress value)  $default,){
final _that = this;
switch (_that) {
case _QuizSessionProgress():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuizSessionProgress value)?  $default,){
final _that = this;
switch (_that) {
case _QuizSessionProgress() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int sessionDateMs,  int remaining)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuizSessionProgress() when $default != null:
return $default(_that.sessionDateMs,_that.remaining);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int sessionDateMs,  int remaining)  $default,) {final _that = this;
switch (_that) {
case _QuizSessionProgress():
return $default(_that.sessionDateMs,_that.remaining);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int sessionDateMs,  int remaining)?  $default,) {final _that = this;
switch (_that) {
case _QuizSessionProgress() when $default != null:
return $default(_that.sessionDateMs,_that.remaining);case _:
  return null;

}
}

}

/// @nodoc


class _QuizSessionProgress implements QuizSessionProgress {
  const _QuizSessionProgress({required this.sessionDateMs, required this.remaining});
  

/// セッション開始日の深夜0時の millisecondsSinceEpoch
@override final  int sessionDateMs;
/// 残り問題数（セッション開始時の出題数から nextQuestion() のたびに減る）
@override final  int remaining;

/// Create a copy of QuizSessionProgress
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuizSessionProgressCopyWith<_QuizSessionProgress> get copyWith => __$QuizSessionProgressCopyWithImpl<_QuizSessionProgress>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuizSessionProgress&&(identical(other.sessionDateMs, sessionDateMs) || other.sessionDateMs == sessionDateMs)&&(identical(other.remaining, remaining) || other.remaining == remaining));
}


@override
int get hashCode => Object.hash(runtimeType,sessionDateMs,remaining);

@override
String toString() {
  return 'QuizSessionProgress(sessionDateMs: $sessionDateMs, remaining: $remaining)';
}


}

/// @nodoc
abstract mixin class _$QuizSessionProgressCopyWith<$Res> implements $QuizSessionProgressCopyWith<$Res> {
  factory _$QuizSessionProgressCopyWith(_QuizSessionProgress value, $Res Function(_QuizSessionProgress) _then) = __$QuizSessionProgressCopyWithImpl;
@override @useResult
$Res call({
 int sessionDateMs, int remaining
});




}
/// @nodoc
class __$QuizSessionProgressCopyWithImpl<$Res>
    implements _$QuizSessionProgressCopyWith<$Res> {
  __$QuizSessionProgressCopyWithImpl(this._self, this._then);

  final _QuizSessionProgress _self;
  final $Res Function(_QuizSessionProgress) _then;

/// Create a copy of QuizSessionProgress
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? sessionDateMs = null,Object? remaining = null,}) {
  return _then(_QuizSessionProgress(
sessionDateMs: null == sessionDateMs ? _self.sessionDateMs : sessionDateMs // ignore: cast_nullable_to_non_nullable
as int,remaining: null == remaining ? _self.remaining : remaining // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on

// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_progress.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$UserProgress {

 String get id; String get quizId; bool get isCorrect; int get attempt_count; DateTime? get lastAnsweredAt; int get forgettingStep; DateTime? get nextReviewAt; bool get isHidden;
/// Create a copy of UserProgress
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserProgressCopyWith<UserProgress> get copyWith => _$UserProgressCopyWithImpl<UserProgress>(this as UserProgress, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserProgress&&(identical(other.id, id) || other.id == id)&&(identical(other.quizId, quizId) || other.quizId == quizId)&&(identical(other.isCorrect, isCorrect) || other.isCorrect == isCorrect)&&(identical(other.attempt_count, attempt_count) || other.attempt_count == attempt_count)&&(identical(other.lastAnsweredAt, lastAnsweredAt) || other.lastAnsweredAt == lastAnsweredAt)&&(identical(other.forgettingStep, forgettingStep) || other.forgettingStep == forgettingStep)&&(identical(other.nextReviewAt, nextReviewAt) || other.nextReviewAt == nextReviewAt)&&(identical(other.isHidden, isHidden) || other.isHidden == isHidden));
}


@override
int get hashCode => Object.hash(runtimeType,id,quizId,isCorrect,attempt_count,lastAnsweredAt,forgettingStep,nextReviewAt,isHidden);

@override
String toString() {
  return 'UserProgress(id: $id, quizId: $quizId, isCorrect: $isCorrect, attempt_count: $attempt_count, lastAnsweredAt: $lastAnsweredAt, forgettingStep: $forgettingStep, nextReviewAt: $nextReviewAt, isHidden: $isHidden)';
}


}

/// @nodoc
abstract mixin class $UserProgressCopyWith<$Res>  {
  factory $UserProgressCopyWith(UserProgress value, $Res Function(UserProgress) _then) = _$UserProgressCopyWithImpl;
@useResult
$Res call({
 String id, String quizId, bool isCorrect, int attempt_count, DateTime? lastAnsweredAt, int forgettingStep, DateTime? nextReviewAt, bool isHidden
});




}
/// @nodoc
class _$UserProgressCopyWithImpl<$Res>
    implements $UserProgressCopyWith<$Res> {
  _$UserProgressCopyWithImpl(this._self, this._then);

  final UserProgress _self;
  final $Res Function(UserProgress) _then;

/// Create a copy of UserProgress
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? quizId = null,Object? isCorrect = null,Object? attempt_count = null,Object? lastAnsweredAt = freezed,Object? forgettingStep = null,Object? nextReviewAt = freezed,Object? isHidden = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,quizId: null == quizId ? _self.quizId : quizId // ignore: cast_nullable_to_non_nullable
as String,isCorrect: null == isCorrect ? _self.isCorrect : isCorrect // ignore: cast_nullable_to_non_nullable
as bool,attempt_count: null == attempt_count ? _self.attempt_count : attempt_count // ignore: cast_nullable_to_non_nullable
as int,lastAnsweredAt: freezed == lastAnsweredAt ? _self.lastAnsweredAt : lastAnsweredAt // ignore: cast_nullable_to_non_nullable
as DateTime?,forgettingStep: null == forgettingStep ? _self.forgettingStep : forgettingStep // ignore: cast_nullable_to_non_nullable
as int,nextReviewAt: freezed == nextReviewAt ? _self.nextReviewAt : nextReviewAt // ignore: cast_nullable_to_non_nullable
as DateTime?,isHidden: null == isHidden ? _self.isHidden : isHidden // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [UserProgress].
extension UserProgressPatterns on UserProgress {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserProgress value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserProgress() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserProgress value)  $default,){
final _that = this;
switch (_that) {
case _UserProgress():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserProgress value)?  $default,){
final _that = this;
switch (_that) {
case _UserProgress() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String quizId,  bool isCorrect,  int attempt_count,  DateTime? lastAnsweredAt,  int forgettingStep,  DateTime? nextReviewAt,  bool isHidden)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserProgress() when $default != null:
return $default(_that.id,_that.quizId,_that.isCorrect,_that.attempt_count,_that.lastAnsweredAt,_that.forgettingStep,_that.nextReviewAt,_that.isHidden);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String quizId,  bool isCorrect,  int attempt_count,  DateTime? lastAnsweredAt,  int forgettingStep,  DateTime? nextReviewAt,  bool isHidden)  $default,) {final _that = this;
switch (_that) {
case _UserProgress():
return $default(_that.id,_that.quizId,_that.isCorrect,_that.attempt_count,_that.lastAnsweredAt,_that.forgettingStep,_that.nextReviewAt,_that.isHidden);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String quizId,  bool isCorrect,  int attempt_count,  DateTime? lastAnsweredAt,  int forgettingStep,  DateTime? nextReviewAt,  bool isHidden)?  $default,) {final _that = this;
switch (_that) {
case _UserProgress() when $default != null:
return $default(_that.id,_that.quizId,_that.isCorrect,_that.attempt_count,_that.lastAnsweredAt,_that.forgettingStep,_that.nextReviewAt,_that.isHidden);case _:
  return null;

}
}

}

/// @nodoc


class _UserProgress implements UserProgress {
  const _UserProgress({required this.id, required this.quizId, required this.isCorrect, required this.attempt_count, this.lastAnsweredAt, required this.forgettingStep, this.nextReviewAt, this.isHidden = false});
  

@override final  String id;
@override final  String quizId;
@override final  bool isCorrect;
@override final  int attempt_count;
@override final  DateTime? lastAnsweredAt;
@override final  int forgettingStep;
@override final  DateTime? nextReviewAt;
@override@JsonKey() final  bool isHidden;

/// Create a copy of UserProgress
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserProgressCopyWith<_UserProgress> get copyWith => __$UserProgressCopyWithImpl<_UserProgress>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserProgress&&(identical(other.id, id) || other.id == id)&&(identical(other.quizId, quizId) || other.quizId == quizId)&&(identical(other.isCorrect, isCorrect) || other.isCorrect == isCorrect)&&(identical(other.attempt_count, attempt_count) || other.attempt_count == attempt_count)&&(identical(other.lastAnsweredAt, lastAnsweredAt) || other.lastAnsweredAt == lastAnsweredAt)&&(identical(other.forgettingStep, forgettingStep) || other.forgettingStep == forgettingStep)&&(identical(other.nextReviewAt, nextReviewAt) || other.nextReviewAt == nextReviewAt)&&(identical(other.isHidden, isHidden) || other.isHidden == isHidden));
}


@override
int get hashCode => Object.hash(runtimeType,id,quizId,isCorrect,attempt_count,lastAnsweredAt,forgettingStep,nextReviewAt,isHidden);

@override
String toString() {
  return 'UserProgress(id: $id, quizId: $quizId, isCorrect: $isCorrect, attempt_count: $attempt_count, lastAnsweredAt: $lastAnsweredAt, forgettingStep: $forgettingStep, nextReviewAt: $nextReviewAt, isHidden: $isHidden)';
}


}

/// @nodoc
abstract mixin class _$UserProgressCopyWith<$Res> implements $UserProgressCopyWith<$Res> {
  factory _$UserProgressCopyWith(_UserProgress value, $Res Function(_UserProgress) _then) = __$UserProgressCopyWithImpl;
@override @useResult
$Res call({
 String id, String quizId, bool isCorrect, int attempt_count, DateTime? lastAnsweredAt, int forgettingStep, DateTime? nextReviewAt, bool isHidden
});




}
/// @nodoc
class __$UserProgressCopyWithImpl<$Res>
    implements _$UserProgressCopyWith<$Res> {
  __$UserProgressCopyWithImpl(this._self, this._then);

  final _UserProgress _self;
  final $Res Function(_UserProgress) _then;

/// Create a copy of UserProgress
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? quizId = null,Object? isCorrect = null,Object? attempt_count = null,Object? lastAnsweredAt = freezed,Object? forgettingStep = null,Object? nextReviewAt = freezed,Object? isHidden = null,}) {
  return _then(_UserProgress(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,quizId: null == quizId ? _self.quizId : quizId // ignore: cast_nullable_to_non_nullable
as String,isCorrect: null == isCorrect ? _self.isCorrect : isCorrect // ignore: cast_nullable_to_non_nullable
as bool,attempt_count: null == attempt_count ? _self.attempt_count : attempt_count // ignore: cast_nullable_to_non_nullable
as int,lastAnsweredAt: freezed == lastAnsweredAt ? _self.lastAnsweredAt : lastAnsweredAt // ignore: cast_nullable_to_non_nullable
as DateTime?,forgettingStep: null == forgettingStep ? _self.forgettingStep : forgettingStep // ignore: cast_nullable_to_non_nullable
as int,nextReviewAt: freezed == nextReviewAt ? _self.nextReviewAt : nextReviewAt // ignore: cast_nullable_to_non_nullable
as DateTime?,isHidden: null == isHidden ? _self.isHidden : isHidden // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on

// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'daily_answer_record.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$DailyAnswerRecord {

 String get date;// 'YYYY-MM-DD'（JST）
 int get answeredCount; int get correctCount;
/// Create a copy of DailyAnswerRecord
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DailyAnswerRecordCopyWith<DailyAnswerRecord> get copyWith => _$DailyAnswerRecordCopyWithImpl<DailyAnswerRecord>(this as DailyAnswerRecord, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyAnswerRecord&&(identical(other.date, date) || other.date == date)&&(identical(other.answeredCount, answeredCount) || other.answeredCount == answeredCount)&&(identical(other.correctCount, correctCount) || other.correctCount == correctCount));
}


@override
int get hashCode => Object.hash(runtimeType,date,answeredCount,correctCount);

@override
String toString() {
  return 'DailyAnswerRecord(date: $date, answeredCount: $answeredCount, correctCount: $correctCount)';
}


}

/// @nodoc
abstract mixin class $DailyAnswerRecordCopyWith<$Res>  {
  factory $DailyAnswerRecordCopyWith(DailyAnswerRecord value, $Res Function(DailyAnswerRecord) _then) = _$DailyAnswerRecordCopyWithImpl;
@useResult
$Res call({
 String date, int answeredCount, int correctCount
});




}
/// @nodoc
class _$DailyAnswerRecordCopyWithImpl<$Res>
    implements $DailyAnswerRecordCopyWith<$Res> {
  _$DailyAnswerRecordCopyWithImpl(this._self, this._then);

  final DailyAnswerRecord _self;
  final $Res Function(DailyAnswerRecord) _then;

/// Create a copy of DailyAnswerRecord
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? date = null,Object? answeredCount = null,Object? correctCount = null,}) {
  return _then(_self.copyWith(
date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,answeredCount: null == answeredCount ? _self.answeredCount : answeredCount // ignore: cast_nullable_to_non_nullable
as int,correctCount: null == correctCount ? _self.correctCount : correctCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [DailyAnswerRecord].
extension DailyAnswerRecordPatterns on DailyAnswerRecord {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DailyAnswerRecord value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DailyAnswerRecord() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DailyAnswerRecord value)  $default,){
final _that = this;
switch (_that) {
case _DailyAnswerRecord():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DailyAnswerRecord value)?  $default,){
final _that = this;
switch (_that) {
case _DailyAnswerRecord() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String date,  int answeredCount,  int correctCount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DailyAnswerRecord() when $default != null:
return $default(_that.date,_that.answeredCount,_that.correctCount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String date,  int answeredCount,  int correctCount)  $default,) {final _that = this;
switch (_that) {
case _DailyAnswerRecord():
return $default(_that.date,_that.answeredCount,_that.correctCount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String date,  int answeredCount,  int correctCount)?  $default,) {final _that = this;
switch (_that) {
case _DailyAnswerRecord() when $default != null:
return $default(_that.date,_that.answeredCount,_that.correctCount);case _:
  return null;

}
}

}

/// @nodoc


class _DailyAnswerRecord implements DailyAnswerRecord {
  const _DailyAnswerRecord({required this.date, required this.answeredCount, required this.correctCount});
  

@override final  String date;
// 'YYYY-MM-DD'（JST）
@override final  int answeredCount;
@override final  int correctCount;

/// Create a copy of DailyAnswerRecord
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DailyAnswerRecordCopyWith<_DailyAnswerRecord> get copyWith => __$DailyAnswerRecordCopyWithImpl<_DailyAnswerRecord>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DailyAnswerRecord&&(identical(other.date, date) || other.date == date)&&(identical(other.answeredCount, answeredCount) || other.answeredCount == answeredCount)&&(identical(other.correctCount, correctCount) || other.correctCount == correctCount));
}


@override
int get hashCode => Object.hash(runtimeType,date,answeredCount,correctCount);

@override
String toString() {
  return 'DailyAnswerRecord(date: $date, answeredCount: $answeredCount, correctCount: $correctCount)';
}


}

/// @nodoc
abstract mixin class _$DailyAnswerRecordCopyWith<$Res> implements $DailyAnswerRecordCopyWith<$Res> {
  factory _$DailyAnswerRecordCopyWith(_DailyAnswerRecord value, $Res Function(_DailyAnswerRecord) _then) = __$DailyAnswerRecordCopyWithImpl;
@override @useResult
$Res call({
 String date, int answeredCount, int correctCount
});




}
/// @nodoc
class __$DailyAnswerRecordCopyWithImpl<$Res>
    implements _$DailyAnswerRecordCopyWith<$Res> {
  __$DailyAnswerRecordCopyWithImpl(this._self, this._then);

  final _DailyAnswerRecord _self;
  final $Res Function(_DailyAnswerRecord) _then;

/// Create a copy of DailyAnswerRecord
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? date = null,Object? answeredCount = null,Object? correctCount = null,}) {
  return _then(_DailyAnswerRecord(
date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,answeredCount: null == answeredCount ? _self.answeredCount : answeredCount // ignore: cast_nullable_to_non_nullable
as int,correctCount: null == correctCount ? _self.correctCount : correctCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on

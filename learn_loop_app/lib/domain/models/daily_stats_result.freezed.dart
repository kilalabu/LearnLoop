// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'daily_stats_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$DailyStatsResult {

 int get totalRequired; List<DailyAnswerRecord> get history; bool get hasMore;
/// Create a copy of DailyStatsResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DailyStatsResultCopyWith<DailyStatsResult> get copyWith => _$DailyStatsResultCopyWithImpl<DailyStatsResult>(this as DailyStatsResult, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStatsResult&&(identical(other.totalRequired, totalRequired) || other.totalRequired == totalRequired)&&const DeepCollectionEquality().equals(other.history, history)&&(identical(other.hasMore, hasMore) || other.hasMore == hasMore));
}


@override
int get hashCode => Object.hash(runtimeType,totalRequired,const DeepCollectionEquality().hash(history),hasMore);

@override
String toString() {
  return 'DailyStatsResult(totalRequired: $totalRequired, history: $history, hasMore: $hasMore)';
}


}

/// @nodoc
abstract mixin class $DailyStatsResultCopyWith<$Res>  {
  factory $DailyStatsResultCopyWith(DailyStatsResult value, $Res Function(DailyStatsResult) _then) = _$DailyStatsResultCopyWithImpl;
@useResult
$Res call({
 int totalRequired, List<DailyAnswerRecord> history, bool hasMore
});




}
/// @nodoc
class _$DailyStatsResultCopyWithImpl<$Res>
    implements $DailyStatsResultCopyWith<$Res> {
  _$DailyStatsResultCopyWithImpl(this._self, this._then);

  final DailyStatsResult _self;
  final $Res Function(DailyStatsResult) _then;

/// Create a copy of DailyStatsResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalRequired = null,Object? history = null,Object? hasMore = null,}) {
  return _then(_self.copyWith(
totalRequired: null == totalRequired ? _self.totalRequired : totalRequired // ignore: cast_nullable_to_non_nullable
as int,history: null == history ? _self.history : history // ignore: cast_nullable_to_non_nullable
as List<DailyAnswerRecord>,hasMore: null == hasMore ? _self.hasMore : hasMore // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [DailyStatsResult].
extension DailyStatsResultPatterns on DailyStatsResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DailyStatsResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DailyStatsResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DailyStatsResult value)  $default,){
final _that = this;
switch (_that) {
case _DailyStatsResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DailyStatsResult value)?  $default,){
final _that = this;
switch (_that) {
case _DailyStatsResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int totalRequired,  List<DailyAnswerRecord> history,  bool hasMore)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DailyStatsResult() when $default != null:
return $default(_that.totalRequired,_that.history,_that.hasMore);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int totalRequired,  List<DailyAnswerRecord> history,  bool hasMore)  $default,) {final _that = this;
switch (_that) {
case _DailyStatsResult():
return $default(_that.totalRequired,_that.history,_that.hasMore);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int totalRequired,  List<DailyAnswerRecord> history,  bool hasMore)?  $default,) {final _that = this;
switch (_that) {
case _DailyStatsResult() when $default != null:
return $default(_that.totalRequired,_that.history,_that.hasMore);case _:
  return null;

}
}

}

/// @nodoc


class _DailyStatsResult implements DailyStatsResult {
  const _DailyStatsResult({required this.totalRequired, required final  List<DailyAnswerRecord> history, required this.hasMore}): _history = history;
  

@override final  int totalRequired;
 final  List<DailyAnswerRecord> _history;
@override List<DailyAnswerRecord> get history {
  if (_history is EqualUnmodifiableListView) return _history;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_history);
}

@override final  bool hasMore;

/// Create a copy of DailyStatsResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DailyStatsResultCopyWith<_DailyStatsResult> get copyWith => __$DailyStatsResultCopyWithImpl<_DailyStatsResult>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DailyStatsResult&&(identical(other.totalRequired, totalRequired) || other.totalRequired == totalRequired)&&const DeepCollectionEquality().equals(other._history, _history)&&(identical(other.hasMore, hasMore) || other.hasMore == hasMore));
}


@override
int get hashCode => Object.hash(runtimeType,totalRequired,const DeepCollectionEquality().hash(_history),hasMore);

@override
String toString() {
  return 'DailyStatsResult(totalRequired: $totalRequired, history: $history, hasMore: $hasMore)';
}


}

/// @nodoc
abstract mixin class _$DailyStatsResultCopyWith<$Res> implements $DailyStatsResultCopyWith<$Res> {
  factory _$DailyStatsResultCopyWith(_DailyStatsResult value, $Res Function(_DailyStatsResult) _then) = __$DailyStatsResultCopyWithImpl;
@override @useResult
$Res call({
 int totalRequired, List<DailyAnswerRecord> history, bool hasMore
});




}
/// @nodoc
class __$DailyStatsResultCopyWithImpl<$Res>
    implements _$DailyStatsResultCopyWith<$Res> {
  __$DailyStatsResultCopyWithImpl(this._self, this._then);

  final _DailyStatsResult _self;
  final $Res Function(_DailyStatsResult) _then;

/// Create a copy of DailyStatsResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalRequired = null,Object? history = null,Object? hasMore = null,}) {
  return _then(_DailyStatsResult(
totalRequired: null == totalRequired ? _self.totalRequired : totalRequired // ignore: cast_nullable_to_non_nullable
as int,history: null == history ? _self._history : history // ignore: cast_nullable_to_non_nullable
as List<DailyAnswerRecord>,hasMore: null == hasMore ? _self.hasMore : hasMore // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on

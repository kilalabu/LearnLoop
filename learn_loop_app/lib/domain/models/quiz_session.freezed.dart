// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quiz_session.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuizSession {

 List<Quiz> get quizzes; int get currentIndex; Map<String, List<String>> get userAnswers;
/// Create a copy of QuizSession
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizSessionCopyWith<QuizSession> get copyWith => _$QuizSessionCopyWithImpl<QuizSession>(this as QuizSession, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizSession&&const DeepCollectionEquality().equals(other.quizzes, quizzes)&&(identical(other.currentIndex, currentIndex) || other.currentIndex == currentIndex)&&const DeepCollectionEquality().equals(other.userAnswers, userAnswers));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(quizzes),currentIndex,const DeepCollectionEquality().hash(userAnswers));

@override
String toString() {
  return 'QuizSession(quizzes: $quizzes, currentIndex: $currentIndex, userAnswers: $userAnswers)';
}


}

/// @nodoc
abstract mixin class $QuizSessionCopyWith<$Res>  {
  factory $QuizSessionCopyWith(QuizSession value, $Res Function(QuizSession) _then) = _$QuizSessionCopyWithImpl;
@useResult
$Res call({
 List<Quiz> quizzes, int currentIndex, Map<String, List<String>> userAnswers
});




}
/// @nodoc
class _$QuizSessionCopyWithImpl<$Res>
    implements $QuizSessionCopyWith<$Res> {
  _$QuizSessionCopyWithImpl(this._self, this._then);

  final QuizSession _self;
  final $Res Function(QuizSession) _then;

/// Create a copy of QuizSession
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? quizzes = null,Object? currentIndex = null,Object? userAnswers = null,}) {
  return _then(_self.copyWith(
quizzes: null == quizzes ? _self.quizzes : quizzes // ignore: cast_nullable_to_non_nullable
as List<Quiz>,currentIndex: null == currentIndex ? _self.currentIndex : currentIndex // ignore: cast_nullable_to_non_nullable
as int,userAnswers: null == userAnswers ? _self.userAnswers : userAnswers // ignore: cast_nullable_to_non_nullable
as Map<String, List<String>>,
  ));
}

}


/// Adds pattern-matching-related methods to [QuizSession].
extension QuizSessionPatterns on QuizSession {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuizSession value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuizSession() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuizSession value)  $default,){
final _that = this;
switch (_that) {
case _QuizSession():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuizSession value)?  $default,){
final _that = this;
switch (_that) {
case _QuizSession() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<Quiz> quizzes,  int currentIndex,  Map<String, List<String>> userAnswers)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuizSession() when $default != null:
return $default(_that.quizzes,_that.currentIndex,_that.userAnswers);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<Quiz> quizzes,  int currentIndex,  Map<String, List<String>> userAnswers)  $default,) {final _that = this;
switch (_that) {
case _QuizSession():
return $default(_that.quizzes,_that.currentIndex,_that.userAnswers);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<Quiz> quizzes,  int currentIndex,  Map<String, List<String>> userAnswers)?  $default,) {final _that = this;
switch (_that) {
case _QuizSession() when $default != null:
return $default(_that.quizzes,_that.currentIndex,_that.userAnswers);case _:
  return null;

}
}

}

/// @nodoc


class _QuizSession extends QuizSession {
  const _QuizSession({required final  List<Quiz> quizzes, required this.currentIndex, final  Map<String, List<String>> userAnswers = const {}}): _quizzes = quizzes,_userAnswers = userAnswers,super._();
  

 final  List<Quiz> _quizzes;
@override List<Quiz> get quizzes {
  if (_quizzes is EqualUnmodifiableListView) return _quizzes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_quizzes);
}

@override final  int currentIndex;
 final  Map<String, List<String>> _userAnswers;
@override@JsonKey() Map<String, List<String>> get userAnswers {
  if (_userAnswers is EqualUnmodifiableMapView) return _userAnswers;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(_userAnswers);
}


/// Create a copy of QuizSession
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuizSessionCopyWith<_QuizSession> get copyWith => __$QuizSessionCopyWithImpl<_QuizSession>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuizSession&&const DeepCollectionEquality().equals(other._quizzes, _quizzes)&&(identical(other.currentIndex, currentIndex) || other.currentIndex == currentIndex)&&const DeepCollectionEquality().equals(other._userAnswers, _userAnswers));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_quizzes),currentIndex,const DeepCollectionEquality().hash(_userAnswers));

@override
String toString() {
  return 'QuizSession(quizzes: $quizzes, currentIndex: $currentIndex, userAnswers: $userAnswers)';
}


}

/// @nodoc
abstract mixin class _$QuizSessionCopyWith<$Res> implements $QuizSessionCopyWith<$Res> {
  factory _$QuizSessionCopyWith(_QuizSession value, $Res Function(_QuizSession) _then) = __$QuizSessionCopyWithImpl;
@override @useResult
$Res call({
 List<Quiz> quizzes, int currentIndex, Map<String, List<String>> userAnswers
});




}
/// @nodoc
class __$QuizSessionCopyWithImpl<$Res>
    implements _$QuizSessionCopyWith<$Res> {
  __$QuizSessionCopyWithImpl(this._self, this._then);

  final _QuizSession _self;
  final $Res Function(_QuizSession) _then;

/// Create a copy of QuizSession
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? quizzes = null,Object? currentIndex = null,Object? userAnswers = null,}) {
  return _then(_QuizSession(
quizzes: null == quizzes ? _self._quizzes : quizzes // ignore: cast_nullable_to_non_nullable
as List<Quiz>,currentIndex: null == currentIndex ? _self.currentIndex : currentIndex // ignore: cast_nullable_to_non_nullable
as int,userAnswers: null == userAnswers ? _self._userAnswers : userAnswers // ignore: cast_nullable_to_non_nullable
as Map<String, List<String>>,
  ));
}


}

// dart format on

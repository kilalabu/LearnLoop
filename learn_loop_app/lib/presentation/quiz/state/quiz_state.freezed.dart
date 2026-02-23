// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quiz_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuizState {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'QuizState()';
}


}

/// @nodoc
class $QuizStateCopyWith<$Res>  {
$QuizStateCopyWith(QuizState _, $Res Function(QuizState) __);
}


/// Adds pattern-matching-related methods to [QuizState].
extension QuizStatePatterns on QuizState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( QuizLoading value)?  loading,TResult Function( QuizAnswering value)?  answering,TResult Function( QuizShowingResult value)?  showingResult,TResult Function( QuizCompleted value)?  completed,TResult Function( QuizError value)?  error,required TResult orElse(),}){
final _that = this;
switch (_that) {
case QuizLoading() when loading != null:
return loading(_that);case QuizAnswering() when answering != null:
return answering(_that);case QuizShowingResult() when showingResult != null:
return showingResult(_that);case QuizCompleted() when completed != null:
return completed(_that);case QuizError() when error != null:
return error(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( QuizLoading value)  loading,required TResult Function( QuizAnswering value)  answering,required TResult Function( QuizShowingResult value)  showingResult,required TResult Function( QuizCompleted value)  completed,required TResult Function( QuizError value)  error,}){
final _that = this;
switch (_that) {
case QuizLoading():
return loading(_that);case QuizAnswering():
return answering(_that);case QuizShowingResult():
return showingResult(_that);case QuizCompleted():
return completed(_that);case QuizError():
return error(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( QuizLoading value)?  loading,TResult? Function( QuizAnswering value)?  answering,TResult? Function( QuizShowingResult value)?  showingResult,TResult? Function( QuizCompleted value)?  completed,TResult? Function( QuizError value)?  error,}){
final _that = this;
switch (_that) {
case QuizLoading() when loading != null:
return loading(_that);case QuizAnswering() when answering != null:
return answering(_that);case QuizShowingResult() when showingResult != null:
return showingResult(_that);case QuizCompleted() when completed != null:
return completed(_that);case QuizError() when error != null:
return error(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  loading,TResult Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds)?  answering,TResult Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds,  bool isCorrect,  bool isHiddenChecked)?  showingResult,TResult Function( int correctCount,  int totalCount,  int completedSessions,  int availableSessions,  bool isAllDone)?  completed,TResult Function( String message)?  error,required TResult orElse(),}) {final _that = this;
switch (_that) {
case QuizLoading() when loading != null:
return loading();case QuizAnswering() when answering != null:
return answering(_that.quizzes,_that.currentIndex,_that.selectedOptionIds);case QuizShowingResult() when showingResult != null:
return showingResult(_that.quizzes,_that.currentIndex,_that.selectedOptionIds,_that.isCorrect,_that.isHiddenChecked);case QuizCompleted() when completed != null:
return completed(_that.correctCount,_that.totalCount,_that.completedSessions,_that.availableSessions,_that.isAllDone);case QuizError() when error != null:
return error(_that.message);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  loading,required TResult Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds)  answering,required TResult Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds,  bool isCorrect,  bool isHiddenChecked)  showingResult,required TResult Function( int correctCount,  int totalCount,  int completedSessions,  int availableSessions,  bool isAllDone)  completed,required TResult Function( String message)  error,}) {final _that = this;
switch (_that) {
case QuizLoading():
return loading();case QuizAnswering():
return answering(_that.quizzes,_that.currentIndex,_that.selectedOptionIds);case QuizShowingResult():
return showingResult(_that.quizzes,_that.currentIndex,_that.selectedOptionIds,_that.isCorrect,_that.isHiddenChecked);case QuizCompleted():
return completed(_that.correctCount,_that.totalCount,_that.completedSessions,_that.availableSessions,_that.isAllDone);case QuizError():
return error(_that.message);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  loading,TResult? Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds)?  answering,TResult? Function( List<Quiz> quizzes,  int currentIndex,  Set<String> selectedOptionIds,  bool isCorrect,  bool isHiddenChecked)?  showingResult,TResult? Function( int correctCount,  int totalCount,  int completedSessions,  int availableSessions,  bool isAllDone)?  completed,TResult? Function( String message)?  error,}) {final _that = this;
switch (_that) {
case QuizLoading() when loading != null:
return loading();case QuizAnswering() when answering != null:
return answering(_that.quizzes,_that.currentIndex,_that.selectedOptionIds);case QuizShowingResult() when showingResult != null:
return showingResult(_that.quizzes,_that.currentIndex,_that.selectedOptionIds,_that.isCorrect,_that.isHiddenChecked);case QuizCompleted() when completed != null:
return completed(_that.correctCount,_that.totalCount,_that.completedSessions,_that.availableSessions,_that.isAllDone);case QuizError() when error != null:
return error(_that.message);case _:
  return null;

}
}

}

/// @nodoc


class QuizLoading implements QuizState {
  const QuizLoading();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'QuizState.loading()';
}


}




/// @nodoc


class QuizAnswering implements QuizState {
  const QuizAnswering({required final  List<Quiz> quizzes, required this.currentIndex, required final  Set<String> selectedOptionIds}): _quizzes = quizzes,_selectedOptionIds = selectedOptionIds;
  

 final  List<Quiz> _quizzes;
 List<Quiz> get quizzes {
  if (_quizzes is EqualUnmodifiableListView) return _quizzes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_quizzes);
}

 final  int currentIndex;
 final  Set<String> _selectedOptionIds;
 Set<String> get selectedOptionIds {
  if (_selectedOptionIds is EqualUnmodifiableSetView) return _selectedOptionIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableSetView(_selectedOptionIds);
}


/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizAnsweringCopyWith<QuizAnswering> get copyWith => _$QuizAnsweringCopyWithImpl<QuizAnswering>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizAnswering&&const DeepCollectionEquality().equals(other._quizzes, _quizzes)&&(identical(other.currentIndex, currentIndex) || other.currentIndex == currentIndex)&&const DeepCollectionEquality().equals(other._selectedOptionIds, _selectedOptionIds));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_quizzes),currentIndex,const DeepCollectionEquality().hash(_selectedOptionIds));

@override
String toString() {
  return 'QuizState.answering(quizzes: $quizzes, currentIndex: $currentIndex, selectedOptionIds: $selectedOptionIds)';
}


}

/// @nodoc
abstract mixin class $QuizAnsweringCopyWith<$Res> implements $QuizStateCopyWith<$Res> {
  factory $QuizAnsweringCopyWith(QuizAnswering value, $Res Function(QuizAnswering) _then) = _$QuizAnsweringCopyWithImpl;
@useResult
$Res call({
 List<Quiz> quizzes, int currentIndex, Set<String> selectedOptionIds
});




}
/// @nodoc
class _$QuizAnsweringCopyWithImpl<$Res>
    implements $QuizAnsweringCopyWith<$Res> {
  _$QuizAnsweringCopyWithImpl(this._self, this._then);

  final QuizAnswering _self;
  final $Res Function(QuizAnswering) _then;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? quizzes = null,Object? currentIndex = null,Object? selectedOptionIds = null,}) {
  return _then(QuizAnswering(
quizzes: null == quizzes ? _self._quizzes : quizzes // ignore: cast_nullable_to_non_nullable
as List<Quiz>,currentIndex: null == currentIndex ? _self.currentIndex : currentIndex // ignore: cast_nullable_to_non_nullable
as int,selectedOptionIds: null == selectedOptionIds ? _self._selectedOptionIds : selectedOptionIds // ignore: cast_nullable_to_non_nullable
as Set<String>,
  ));
}


}

/// @nodoc


class QuizShowingResult implements QuizState {
  const QuizShowingResult({required final  List<Quiz> quizzes, required this.currentIndex, required final  Set<String> selectedOptionIds, required this.isCorrect, this.isHiddenChecked = false}): _quizzes = quizzes,_selectedOptionIds = selectedOptionIds;
  

 final  List<Quiz> _quizzes;
 List<Quiz> get quizzes {
  if (_quizzes is EqualUnmodifiableListView) return _quizzes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_quizzes);
}

 final  int currentIndex;
 final  Set<String> _selectedOptionIds;
 Set<String> get selectedOptionIds {
  if (_selectedOptionIds is EqualUnmodifiableSetView) return _selectedOptionIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableSetView(_selectedOptionIds);
}

 final  bool isCorrect;
/// 解説の非表示選択肢を展開済みかどうか
@JsonKey() final  bool isHiddenChecked;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizShowingResultCopyWith<QuizShowingResult> get copyWith => _$QuizShowingResultCopyWithImpl<QuizShowingResult>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizShowingResult&&const DeepCollectionEquality().equals(other._quizzes, _quizzes)&&(identical(other.currentIndex, currentIndex) || other.currentIndex == currentIndex)&&const DeepCollectionEquality().equals(other._selectedOptionIds, _selectedOptionIds)&&(identical(other.isCorrect, isCorrect) || other.isCorrect == isCorrect)&&(identical(other.isHiddenChecked, isHiddenChecked) || other.isHiddenChecked == isHiddenChecked));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_quizzes),currentIndex,const DeepCollectionEquality().hash(_selectedOptionIds),isCorrect,isHiddenChecked);

@override
String toString() {
  return 'QuizState.showingResult(quizzes: $quizzes, currentIndex: $currentIndex, selectedOptionIds: $selectedOptionIds, isCorrect: $isCorrect, isHiddenChecked: $isHiddenChecked)';
}


}

/// @nodoc
abstract mixin class $QuizShowingResultCopyWith<$Res> implements $QuizStateCopyWith<$Res> {
  factory $QuizShowingResultCopyWith(QuizShowingResult value, $Res Function(QuizShowingResult) _then) = _$QuizShowingResultCopyWithImpl;
@useResult
$Res call({
 List<Quiz> quizzes, int currentIndex, Set<String> selectedOptionIds, bool isCorrect, bool isHiddenChecked
});




}
/// @nodoc
class _$QuizShowingResultCopyWithImpl<$Res>
    implements $QuizShowingResultCopyWith<$Res> {
  _$QuizShowingResultCopyWithImpl(this._self, this._then);

  final QuizShowingResult _self;
  final $Res Function(QuizShowingResult) _then;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? quizzes = null,Object? currentIndex = null,Object? selectedOptionIds = null,Object? isCorrect = null,Object? isHiddenChecked = null,}) {
  return _then(QuizShowingResult(
quizzes: null == quizzes ? _self._quizzes : quizzes // ignore: cast_nullable_to_non_nullable
as List<Quiz>,currentIndex: null == currentIndex ? _self.currentIndex : currentIndex // ignore: cast_nullable_to_non_nullable
as int,selectedOptionIds: null == selectedOptionIds ? _self._selectedOptionIds : selectedOptionIds // ignore: cast_nullable_to_non_nullable
as Set<String>,isCorrect: null == isCorrect ? _self.isCorrect : isCorrect // ignore: cast_nullable_to_non_nullable
as bool,isHiddenChecked: null == isHiddenChecked ? _self.isHiddenChecked : isHiddenChecked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

/// @nodoc


class QuizCompleted implements QuizState {
  const QuizCompleted({required this.correctCount, required this.totalCount, required this.completedSessions, required this.availableSessions, required this.isAllDone});
  

 final  int correctCount;
 final  int totalCount;
 final  int completedSessions;
 final  int availableSessions;
 final  bool isAllDone;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizCompletedCopyWith<QuizCompleted> get copyWith => _$QuizCompletedCopyWithImpl<QuizCompleted>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizCompleted&&(identical(other.correctCount, correctCount) || other.correctCount == correctCount)&&(identical(other.totalCount, totalCount) || other.totalCount == totalCount)&&(identical(other.completedSessions, completedSessions) || other.completedSessions == completedSessions)&&(identical(other.availableSessions, availableSessions) || other.availableSessions == availableSessions)&&(identical(other.isAllDone, isAllDone) || other.isAllDone == isAllDone));
}


@override
int get hashCode => Object.hash(runtimeType,correctCount,totalCount,completedSessions,availableSessions,isAllDone);

@override
String toString() {
  return 'QuizState.completed(correctCount: $correctCount, totalCount: $totalCount, completedSessions: $completedSessions, availableSessions: $availableSessions, isAllDone: $isAllDone)';
}


}

/// @nodoc
abstract mixin class $QuizCompletedCopyWith<$Res> implements $QuizStateCopyWith<$Res> {
  factory $QuizCompletedCopyWith(QuizCompleted value, $Res Function(QuizCompleted) _then) = _$QuizCompletedCopyWithImpl;
@useResult
$Res call({
 int correctCount, int totalCount, int completedSessions, int availableSessions, bool isAllDone
});




}
/// @nodoc
class _$QuizCompletedCopyWithImpl<$Res>
    implements $QuizCompletedCopyWith<$Res> {
  _$QuizCompletedCopyWithImpl(this._self, this._then);

  final QuizCompleted _self;
  final $Res Function(QuizCompleted) _then;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? correctCount = null,Object? totalCount = null,Object? completedSessions = null,Object? availableSessions = null,Object? isAllDone = null,}) {
  return _then(QuizCompleted(
correctCount: null == correctCount ? _self.correctCount : correctCount // ignore: cast_nullable_to_non_nullable
as int,totalCount: null == totalCount ? _self.totalCount : totalCount // ignore: cast_nullable_to_non_nullable
as int,completedSessions: null == completedSessions ? _self.completedSessions : completedSessions // ignore: cast_nullable_to_non_nullable
as int,availableSessions: null == availableSessions ? _self.availableSessions : availableSessions // ignore: cast_nullable_to_non_nullable
as int,isAllDone: null == isAllDone ? _self.isAllDone : isAllDone // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

/// @nodoc


class QuizError implements QuizState {
  const QuizError(this.message);
  

 final  String message;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizErrorCopyWith<QuizError> get copyWith => _$QuizErrorCopyWithImpl<QuizError>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuizError&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,message);

@override
String toString() {
  return 'QuizState.error(message: $message)';
}


}

/// @nodoc
abstract mixin class $QuizErrorCopyWith<$Res> implements $QuizStateCopyWith<$Res> {
  factory $QuizErrorCopyWith(QuizError value, $Res Function(QuizError) _then) = _$QuizErrorCopyWithImpl;
@useResult
$Res call({
 String message
});




}
/// @nodoc
class _$QuizErrorCopyWithImpl<$Res>
    implements $QuizErrorCopyWith<$Res> {
  _$QuizErrorCopyWithImpl(this._self, this._then);

  final QuizError _self;
  final $Res Function(QuizError) _then;

/// Create a copy of QuizState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,}) {
  return _then(QuizError(
null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on

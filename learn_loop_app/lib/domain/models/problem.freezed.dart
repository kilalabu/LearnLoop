// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'problem.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$Problem {

 String get id; String get question; List<ProblemOption> get options; String get explanation; String? get sourceText; String? get sourceUrl; String? get genre;
/// Create a copy of Problem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProblemCopyWith<Problem> get copyWith => _$ProblemCopyWithImpl<Problem>(this as Problem, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Problem&&(identical(other.id, id) || other.id == id)&&(identical(other.question, question) || other.question == question)&&const DeepCollectionEquality().equals(other.options, options)&&(identical(other.explanation, explanation) || other.explanation == explanation)&&(identical(other.sourceText, sourceText) || other.sourceText == sourceText)&&(identical(other.sourceUrl, sourceUrl) || other.sourceUrl == sourceUrl)&&(identical(other.genre, genre) || other.genre == genre));
}


@override
int get hashCode => Object.hash(runtimeType,id,question,const DeepCollectionEquality().hash(options),explanation,sourceText,sourceUrl,genre);

@override
String toString() {
  return 'Problem(id: $id, question: $question, options: $options, explanation: $explanation, sourceText: $sourceText, sourceUrl: $sourceUrl, genre: $genre)';
}


}

/// @nodoc
abstract mixin class $ProblemCopyWith<$Res>  {
  factory $ProblemCopyWith(Problem value, $Res Function(Problem) _then) = _$ProblemCopyWithImpl;
@useResult
$Res call({
 String id, String question, List<ProblemOption> options, String explanation, String? sourceText, String? sourceUrl, String? genre
});




}
/// @nodoc
class _$ProblemCopyWithImpl<$Res>
    implements $ProblemCopyWith<$Res> {
  _$ProblemCopyWithImpl(this._self, this._then);

  final Problem _self;
  final $Res Function(Problem) _then;

/// Create a copy of Problem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? question = null,Object? options = null,Object? explanation = null,Object? sourceText = freezed,Object? sourceUrl = freezed,Object? genre = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,options: null == options ? _self.options : options // ignore: cast_nullable_to_non_nullable
as List<ProblemOption>,explanation: null == explanation ? _self.explanation : explanation // ignore: cast_nullable_to_non_nullable
as String,sourceText: freezed == sourceText ? _self.sourceText : sourceText // ignore: cast_nullable_to_non_nullable
as String?,sourceUrl: freezed == sourceUrl ? _self.sourceUrl : sourceUrl // ignore: cast_nullable_to_non_nullable
as String?,genre: freezed == genre ? _self.genre : genre // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Problem].
extension ProblemPatterns on Problem {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Problem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Problem() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Problem value)  $default,){
final _that = this;
switch (_that) {
case _Problem():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Problem value)?  $default,){
final _that = this;
switch (_that) {
case _Problem() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String question,  List<ProblemOption> options,  String explanation,  String? sourceText,  String? sourceUrl,  String? genre)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Problem() when $default != null:
return $default(_that.id,_that.question,_that.options,_that.explanation,_that.sourceText,_that.sourceUrl,_that.genre);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String question,  List<ProblemOption> options,  String explanation,  String? sourceText,  String? sourceUrl,  String? genre)  $default,) {final _that = this;
switch (_that) {
case _Problem():
return $default(_that.id,_that.question,_that.options,_that.explanation,_that.sourceText,_that.sourceUrl,_that.genre);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String question,  List<ProblemOption> options,  String explanation,  String? sourceText,  String? sourceUrl,  String? genre)?  $default,) {final _that = this;
switch (_that) {
case _Problem() when $default != null:
return $default(_that.id,_that.question,_that.options,_that.explanation,_that.sourceText,_that.sourceUrl,_that.genre);case _:
  return null;

}
}

}

/// @nodoc


class _Problem implements Problem {
  const _Problem({required this.id, required this.question, required final  List<ProblemOption> options, required this.explanation, this.sourceText, this.sourceUrl, this.genre}): _options = options;
  

@override final  String id;
@override final  String question;
 final  List<ProblemOption> _options;
@override List<ProblemOption> get options {
  if (_options is EqualUnmodifiableListView) return _options;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_options);
}

@override final  String explanation;
@override final  String? sourceText;
@override final  String? sourceUrl;
@override final  String? genre;

/// Create a copy of Problem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProblemCopyWith<_Problem> get copyWith => __$ProblemCopyWithImpl<_Problem>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Problem&&(identical(other.id, id) || other.id == id)&&(identical(other.question, question) || other.question == question)&&const DeepCollectionEquality().equals(other._options, _options)&&(identical(other.explanation, explanation) || other.explanation == explanation)&&(identical(other.sourceText, sourceText) || other.sourceText == sourceText)&&(identical(other.sourceUrl, sourceUrl) || other.sourceUrl == sourceUrl)&&(identical(other.genre, genre) || other.genre == genre));
}


@override
int get hashCode => Object.hash(runtimeType,id,question,const DeepCollectionEquality().hash(_options),explanation,sourceText,sourceUrl,genre);

@override
String toString() {
  return 'Problem(id: $id, question: $question, options: $options, explanation: $explanation, sourceText: $sourceText, sourceUrl: $sourceUrl, genre: $genre)';
}


}

/// @nodoc
abstract mixin class _$ProblemCopyWith<$Res> implements $ProblemCopyWith<$Res> {
  factory _$ProblemCopyWith(_Problem value, $Res Function(_Problem) _then) = __$ProblemCopyWithImpl;
@override @useResult
$Res call({
 String id, String question, List<ProblemOption> options, String explanation, String? sourceText, String? sourceUrl, String? genre
});




}
/// @nodoc
class __$ProblemCopyWithImpl<$Res>
    implements _$ProblemCopyWith<$Res> {
  __$ProblemCopyWithImpl(this._self, this._then);

  final _Problem _self;
  final $Res Function(_Problem) _then;

/// Create a copy of Problem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? question = null,Object? options = null,Object? explanation = null,Object? sourceText = freezed,Object? sourceUrl = freezed,Object? genre = freezed,}) {
  return _then(_Problem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,options: null == options ? _self._options : options // ignore: cast_nullable_to_non_nullable
as List<ProblemOption>,explanation: null == explanation ? _self.explanation : explanation // ignore: cast_nullable_to_non_nullable
as String,sourceText: freezed == sourceText ? _self.sourceText : sourceText // ignore: cast_nullable_to_non_nullable
as String?,sourceUrl: freezed == sourceUrl ? _self.sourceUrl : sourceUrl // ignore: cast_nullable_to_non_nullable
as String?,genre: freezed == genre ? _self.genre : genre // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$ProblemOption {

 String get id; String get label; String get text; bool get isCorrect;
/// Create a copy of ProblemOption
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProblemOptionCopyWith<ProblemOption> get copyWith => _$ProblemOptionCopyWithImpl<ProblemOption>(this as ProblemOption, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ProblemOption&&(identical(other.id, id) || other.id == id)&&(identical(other.label, label) || other.label == label)&&(identical(other.text, text) || other.text == text)&&(identical(other.isCorrect, isCorrect) || other.isCorrect == isCorrect));
}


@override
int get hashCode => Object.hash(runtimeType,id,label,text,isCorrect);

@override
String toString() {
  return 'ProblemOption(id: $id, label: $label, text: $text, isCorrect: $isCorrect)';
}


}

/// @nodoc
abstract mixin class $ProblemOptionCopyWith<$Res>  {
  factory $ProblemOptionCopyWith(ProblemOption value, $Res Function(ProblemOption) _then) = _$ProblemOptionCopyWithImpl;
@useResult
$Res call({
 String id, String label, String text, bool isCorrect
});




}
/// @nodoc
class _$ProblemOptionCopyWithImpl<$Res>
    implements $ProblemOptionCopyWith<$Res> {
  _$ProblemOptionCopyWithImpl(this._self, this._then);

  final ProblemOption _self;
  final $Res Function(ProblemOption) _then;

/// Create a copy of ProblemOption
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? label = null,Object? text = null,Object? isCorrect = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,text: null == text ? _self.text : text // ignore: cast_nullable_to_non_nullable
as String,isCorrect: null == isCorrect ? _self.isCorrect : isCorrect // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [ProblemOption].
extension ProblemOptionPatterns on ProblemOption {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ProblemOption value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ProblemOption() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ProblemOption value)  $default,){
final _that = this;
switch (_that) {
case _ProblemOption():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ProblemOption value)?  $default,){
final _that = this;
switch (_that) {
case _ProblemOption() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String label,  String text,  bool isCorrect)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ProblemOption() when $default != null:
return $default(_that.id,_that.label,_that.text,_that.isCorrect);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String label,  String text,  bool isCorrect)  $default,) {final _that = this;
switch (_that) {
case _ProblemOption():
return $default(_that.id,_that.label,_that.text,_that.isCorrect);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String label,  String text,  bool isCorrect)?  $default,) {final _that = this;
switch (_that) {
case _ProblemOption() when $default != null:
return $default(_that.id,_that.label,_that.text,_that.isCorrect);case _:
  return null;

}
}

}

/// @nodoc


class _ProblemOption implements ProblemOption {
  const _ProblemOption({required this.id, required this.label, required this.text, required this.isCorrect});
  

@override final  String id;
@override final  String label;
@override final  String text;
@override final  bool isCorrect;

/// Create a copy of ProblemOption
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProblemOptionCopyWith<_ProblemOption> get copyWith => __$ProblemOptionCopyWithImpl<_ProblemOption>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ProblemOption&&(identical(other.id, id) || other.id == id)&&(identical(other.label, label) || other.label == label)&&(identical(other.text, text) || other.text == text)&&(identical(other.isCorrect, isCorrect) || other.isCorrect == isCorrect));
}


@override
int get hashCode => Object.hash(runtimeType,id,label,text,isCorrect);

@override
String toString() {
  return 'ProblemOption(id: $id, label: $label, text: $text, isCorrect: $isCorrect)';
}


}

/// @nodoc
abstract mixin class _$ProblemOptionCopyWith<$Res> implements $ProblemOptionCopyWith<$Res> {
  factory _$ProblemOptionCopyWith(_ProblemOption value, $Res Function(_ProblemOption) _then) = __$ProblemOptionCopyWithImpl;
@override @useResult
$Res call({
 String id, String label, String text, bool isCorrect
});




}
/// @nodoc
class __$ProblemOptionCopyWithImpl<$Res>
    implements _$ProblemOptionCopyWith<$Res> {
  __$ProblemOptionCopyWithImpl(this._self, this._then);

  final _ProblemOption _self;
  final $Res Function(_ProblemOption) _then;

/// Create a copy of ProblemOption
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? label = null,Object? text = null,Object? isCorrect = null,}) {
  return _then(_ProblemOption(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,text: null == text ? _self.text : text // ignore: cast_nullable_to_non_nullable
as String,isCorrect: null == isCorrect ? _self.isCorrect : isCorrect // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on

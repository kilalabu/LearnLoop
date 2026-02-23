// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'session_action.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$SessionAction {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionAction);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'SessionAction()';
}


}

/// @nodoc
class $SessionActionCopyWith<$Res>  {
$SessionActionCopyWith(SessionAction _, $Res Function(SessionAction) __);
}


/// Adds pattern-matching-related methods to [SessionAction].
extension SessionActionPatterns on SessionAction {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( SessionActionStartNew value)?  startNew,TResult Function( SessionActionResume value)?  resume,TResult Function( SessionActionDone value)?  sessionDone,TResult Function( SessionActionAllDone value)?  allDone,required TResult orElse(),}){
final _that = this;
switch (_that) {
case SessionActionStartNew() when startNew != null:
return startNew(_that);case SessionActionResume() when resume != null:
return resume(_that);case SessionActionDone() when sessionDone != null:
return sessionDone(_that);case SessionActionAllDone() when allDone != null:
return allDone(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( SessionActionStartNew value)  startNew,required TResult Function( SessionActionResume value)  resume,required TResult Function( SessionActionDone value)  sessionDone,required TResult Function( SessionActionAllDone value)  allDone,}){
final _that = this;
switch (_that) {
case SessionActionStartNew():
return startNew(_that);case SessionActionResume():
return resume(_that);case SessionActionDone():
return sessionDone(_that);case SessionActionAllDone():
return allDone(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( SessionActionStartNew value)?  startNew,TResult? Function( SessionActionResume value)?  resume,TResult? Function( SessionActionDone value)?  sessionDone,TResult? Function( SessionActionAllDone value)?  allDone,}){
final _that = this;
switch (_that) {
case SessionActionStartNew() when startNew != null:
return startNew(_that);case SessionActionResume() when resume != null:
return resume(_that);case SessionActionDone() when sessionDone != null:
return sessionDone(_that);case SessionActionAllDone() when allDone != null:
return allDone(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  startNew,TResult Function( int remaining)?  resume,TResult Function( int completedSessions,  int availableSessions)?  sessionDone,TResult Function( int completedSessions)?  allDone,required TResult orElse(),}) {final _that = this;
switch (_that) {
case SessionActionStartNew() when startNew != null:
return startNew();case SessionActionResume() when resume != null:
return resume(_that.remaining);case SessionActionDone() when sessionDone != null:
return sessionDone(_that.completedSessions,_that.availableSessions);case SessionActionAllDone() when allDone != null:
return allDone(_that.completedSessions);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  startNew,required TResult Function( int remaining)  resume,required TResult Function( int completedSessions,  int availableSessions)  sessionDone,required TResult Function( int completedSessions)  allDone,}) {final _that = this;
switch (_that) {
case SessionActionStartNew():
return startNew();case SessionActionResume():
return resume(_that.remaining);case SessionActionDone():
return sessionDone(_that.completedSessions,_that.availableSessions);case SessionActionAllDone():
return allDone(_that.completedSessions);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  startNew,TResult? Function( int remaining)?  resume,TResult? Function( int completedSessions,  int availableSessions)?  sessionDone,TResult? Function( int completedSessions)?  allDone,}) {final _that = this;
switch (_that) {
case SessionActionStartNew() when startNew != null:
return startNew();case SessionActionResume() when resume != null:
return resume(_that.remaining);case SessionActionDone() when sessionDone != null:
return sessionDone(_that.completedSessions,_that.availableSessions);case SessionActionAllDone() when allDone != null:
return allDone(_that.completedSessions);case _:
  return null;

}
}

}

/// @nodoc


class SessionActionStartNew implements SessionAction {
  const SessionActionStartNew();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionActionStartNew);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'SessionAction.startNew()';
}


}




/// @nodoc


class SessionActionResume implements SessionAction {
  const SessionActionResume({required this.remaining});
  

 final  int remaining;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SessionActionResumeCopyWith<SessionActionResume> get copyWith => _$SessionActionResumeCopyWithImpl<SessionActionResume>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionActionResume&&(identical(other.remaining, remaining) || other.remaining == remaining));
}


@override
int get hashCode => Object.hash(runtimeType,remaining);

@override
String toString() {
  return 'SessionAction.resume(remaining: $remaining)';
}


}

/// @nodoc
abstract mixin class $SessionActionResumeCopyWith<$Res> implements $SessionActionCopyWith<$Res> {
  factory $SessionActionResumeCopyWith(SessionActionResume value, $Res Function(SessionActionResume) _then) = _$SessionActionResumeCopyWithImpl;
@useResult
$Res call({
 int remaining
});




}
/// @nodoc
class _$SessionActionResumeCopyWithImpl<$Res>
    implements $SessionActionResumeCopyWith<$Res> {
  _$SessionActionResumeCopyWithImpl(this._self, this._then);

  final SessionActionResume _self;
  final $Res Function(SessionActionResume) _then;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? remaining = null,}) {
  return _then(SessionActionResume(
remaining: null == remaining ? _self.remaining : remaining // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc


class SessionActionDone implements SessionAction {
  const SessionActionDone({required this.completedSessions, required this.availableSessions});
  

 final  int completedSessions;
 final  int availableSessions;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SessionActionDoneCopyWith<SessionActionDone> get copyWith => _$SessionActionDoneCopyWithImpl<SessionActionDone>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionActionDone&&(identical(other.completedSessions, completedSessions) || other.completedSessions == completedSessions)&&(identical(other.availableSessions, availableSessions) || other.availableSessions == availableSessions));
}


@override
int get hashCode => Object.hash(runtimeType,completedSessions,availableSessions);

@override
String toString() {
  return 'SessionAction.sessionDone(completedSessions: $completedSessions, availableSessions: $availableSessions)';
}


}

/// @nodoc
abstract mixin class $SessionActionDoneCopyWith<$Res> implements $SessionActionCopyWith<$Res> {
  factory $SessionActionDoneCopyWith(SessionActionDone value, $Res Function(SessionActionDone) _then) = _$SessionActionDoneCopyWithImpl;
@useResult
$Res call({
 int completedSessions, int availableSessions
});




}
/// @nodoc
class _$SessionActionDoneCopyWithImpl<$Res>
    implements $SessionActionDoneCopyWith<$Res> {
  _$SessionActionDoneCopyWithImpl(this._self, this._then);

  final SessionActionDone _self;
  final $Res Function(SessionActionDone) _then;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? completedSessions = null,Object? availableSessions = null,}) {
  return _then(SessionActionDone(
completedSessions: null == completedSessions ? _self.completedSessions : completedSessions // ignore: cast_nullable_to_non_nullable
as int,availableSessions: null == availableSessions ? _self.availableSessions : availableSessions // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc


class SessionActionAllDone implements SessionAction {
  const SessionActionAllDone({required this.completedSessions});
  

 final  int completedSessions;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SessionActionAllDoneCopyWith<SessionActionAllDone> get copyWith => _$SessionActionAllDoneCopyWithImpl<SessionActionAllDone>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionActionAllDone&&(identical(other.completedSessions, completedSessions) || other.completedSessions == completedSessions));
}


@override
int get hashCode => Object.hash(runtimeType,completedSessions);

@override
String toString() {
  return 'SessionAction.allDone(completedSessions: $completedSessions)';
}


}

/// @nodoc
abstract mixin class $SessionActionAllDoneCopyWith<$Res> implements $SessionActionCopyWith<$Res> {
  factory $SessionActionAllDoneCopyWith(SessionActionAllDone value, $Res Function(SessionActionAllDone) _then) = _$SessionActionAllDoneCopyWithImpl;
@useResult
$Res call({
 int completedSessions
});




}
/// @nodoc
class _$SessionActionAllDoneCopyWithImpl<$Res>
    implements $SessionActionAllDoneCopyWith<$Res> {
  _$SessionActionAllDoneCopyWithImpl(this._self, this._then);

  final SessionActionAllDone _self;
  final $Res Function(SessionActionAllDone) _then;

/// Create a copy of SessionAction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? completedSessions = null,}) {
  return _then(SessionActionAllDone(
completedSessions: null == completedSessions ? _self.completedSessions : completedSessions // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on

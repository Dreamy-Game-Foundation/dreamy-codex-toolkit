# Fire And Forget

Unawaited tasks must observe exceptions through `.Forget()` with policy or an equivalent handler. Use `UniTaskVoid` only at callback/event boundaries.

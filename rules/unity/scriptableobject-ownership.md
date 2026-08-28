# unity.scriptableobject-ownership

Use ScriptableObjects for authored data unless runtime mutation ownership is explicit.

Clone or route mutable state through a runtime owner when needed.

If static authored data does not need server-side tuning, A/B rollout, or live operations through Remote Config, a ScriptableObject asset is acceptable and often simpler. Keep Remote Config for values that truly need remote change, segmentation, rollout, or operations ownership.

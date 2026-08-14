# App Lifecycle

App-level services own cross-scene work, pause/resume handling, save-on-pause, and long-lived async operations. Scene/panel/object work should use shorter lifetimes and cancel before app-owned work mutates destroyed owners.

# Adaptive layout during a reskin

Use `unity-ui-responsive` for detailed anchor/scaler, SafeArea, content-fit and animation ownership decisions. Keep full-bleed backgrounds outside SafeArea. Inspect the live configuration again if the user changes CanvasScaler during the reskin; do not reset an existing shared canvas just to simplify a panel.

Preserve the reference composition and user placement, then repair the scoped layout through that responsive workflow. Font/material ownership and sprite rendering choices stay with `unity-ui-reskin`.

If nested content is excluded, an outer instance placement change may still be needed, but do not edit internal labels/layout/materials or apply its overrides to the source. Record that distinction in the handoff.

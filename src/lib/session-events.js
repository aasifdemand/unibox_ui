/**
 * session-events.js
 *
 * A tiny string constant for the custom browser event that signals
 * "the user's session is definitively expired" (access token + refresh
 * token both failed).
 *
 * api.js dispatches it; SessionExpiredModal.jsx listens for it.
 * Using a custom DOM event is the cleanest way to bridge a plain JS
 * module (api.js) with the React component tree without creating
 * circular imports.
 */
export const SESSION_EXPIRED_EVENT = 'unibox:session-expired';

/**
 * AI Support Chat Widget
 * Embed with: <script src="https://your-domain.com/widget.js"></script>
 *
 * Optional configuration (set BEFORE the script tag):
 *   window.AI_SUPPORT_CONFIG = { apiUrl: "https://your-domain.com", projectId: "your-project" };
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  var cfg = window.AI_SUPPORT_CONFIG || {};
  var projectId = cfg.projectId || 'default';

  // Derive origin from the script tag src if apiUrl not explicitly set
  var apiUrl = (cfg.apiUrl || '').replace(/\/$/, '');
  if (!apiUrl) {
    var scripts = document.getElementsByTagName('script');
    var selfSrc = scripts[scripts.length - 1].src;
    apiUrl = selfSrc.replace(/\/widget\.js.*$/, '');
  }

  // Prevent double-mount
  if (document.getElementById('__ai-support-widget')) return;

  // ── State ───────────────────────────────────────────────────────────────────
  var isOpen = false;

  // ── SVG icons (inline to avoid extra requests) ───────────────────────────────
  var ICON_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  var ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 9l-7 7-7-7"/></svg>';

  // ── DOM elements ─────────────────────────────────────────────────────────────

  // Wrapper (for identity check only — not positioned)
  var wrapper = document.createElement('div');
  wrapper.id = '__ai-support-widget';

  // Floating button
  var btn = document.createElement('button');
  btn.id = '__ai-support-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = ICON_CHAT;
  btn.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'right:20px',
    'width:56px',
    'height:56px',
    'border-radius:50%',
    'background:#4f46e5',
    'border:none',
    'cursor:pointer',
    'z-index:2147483646',
    'box-shadow:0 4px 24px rgba(79,70,229,0.5)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'transition:transform 0.15s ease, background 0.15s ease',
    'padding:0',
  ].join(';');

  btn.addEventListener('mouseenter', function () {
    btn.style.transform = 'scale(1.08)';
    btn.style.background = '#4338ca';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.transform = 'scale(1)';
    btn.style.background = '#4f46e5';
  });

  // Unread badge (shown when widget is closed and AI responds)
  var badge = document.createElement('span');
  badge.id = '__ai-support-badge';
  badge.style.cssText = [
    'position:absolute',
    'top:-3px',
    'right:-3px',
    'width:16px',
    'height:16px',
    'background:#ef4444',
    'border-radius:50%',
    'border:2px solid white',
    'display:none',
  ].join(';');
  btn.appendChild(badge);

  // Chat iframe
  var iframe = document.createElement('iframe');
  iframe.id = '__ai-support-iframe';
  iframe.title = 'AI Support Chat';
  iframe.setAttribute('aria-label', 'AI Support Chat Widget');
  iframe.setAttribute('frameborder', '0');
  iframe.src = apiUrl + '/widget-frame?projectId=' + encodeURIComponent(projectId);
  iframe.style.cssText = [
    'position:fixed',
    'bottom:88px',
    'right:20px',
    'width:375px',
    'height:520px',
    'border:none',
    'border-radius:16px',
    'z-index:2147483645',
    'box-shadow:0 8px 40px rgba(0,0,0,0.18)',
    'display:none',
    'transition:opacity 0.2s ease, transform 0.2s ease',
    'opacity:0',
    'transform:translateY(12px) scale(0.97)',
    'transform-origin:bottom right',
  ].join(';');

  // ── Open / close ─────────────────────────────────────────────────────────────

  function openWidget() {
    isOpen = true;
    badge.style.display = 'none';
    iframe.style.display = 'block';
    // Trigger CSS transition on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0) scale(1)';
      });
    });
    btn.innerHTML = ICON_CLOSE;
    btn.setAttribute('aria-label', 'Close chat');
    btn.appendChild(badge); // re-append badge (innerHTML cleared it)
  }

  function closeWidget() {
    isOpen = false;
    iframe.style.opacity = '0';
    iframe.style.transform = 'translateY(12px) scale(0.97)';
    setTimeout(function () {
      if (!isOpen) iframe.style.display = 'none';
    }, 200);
    btn.innerHTML = ICON_CHAT;
    btn.setAttribute('aria-label', 'Open chat');
    btn.appendChild(badge);
  }

  btn.addEventListener('click', function () {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  // Keyboard: close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  // Listen for messages from iframe (close request, unread notifications)
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'AI_WIDGET_CLOSE') {
      closeWidget();
    }
    if (e.data.type === 'AI_WIDGET_UNREAD' && !isOpen) {
      badge.style.display = 'block';
    }
  });

  // ── Mount ─────────────────────────────────────────────────────────────────────

  function mount() {
    document.body.appendChild(wrapper);
    document.body.appendChild(btn);
    document.body.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

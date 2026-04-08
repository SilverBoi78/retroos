const express = require('express');
const { Router } = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware');

const router = Router();

router.use(requireAuth);

const DEFAULT_SETTINGS = {
  wallpaper: { type: 'theme', value: null },
  accentColor: null,
  iconSize: 'medium',
  fontSize: 'medium',
  clockFormat: '24h',
};

function getOrCreateSettings(userId) {
  let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  if (!settings) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
    settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  }
  return settings;
}

function parseSettingsJson(raw) {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// GET /api/settings
router.get('/', (req, res) => {
  const row = getOrCreateSettings(req.user.id);
  const settings = parseSettingsJson(row.settings_json);
  // Check if user has a custom wallpaper uploaded
  const hasWallpaper = !!db.prepare('SELECT 1 FROM user_wallpapers WHERE user_id = ?').get(req.user.id);
  res.json({ themeId: row.theme_id, settings, hasWallpaper });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const { themeId, settings } = req.body;
  const row = getOrCreateSettings(req.user.id);

  if (themeId !== undefined && themeId !== null) {
    db.prepare('UPDATE user_settings SET theme_id = ? WHERE id = ?').run(themeId, row.id);
  }

  if (settings !== undefined && settings !== null) {
    // Merge with existing settings
    const existing = parseSettingsJson(row.settings_json);
    const merged = { ...existing, ...settings };
    db.prepare('UPDATE user_settings SET settings_json = ? WHERE id = ?')
      .run(JSON.stringify(merged), row.id);
  }

  res.json({ ok: true });
});

// POST /api/settings/wallpaper — upload custom wallpaper image
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

router.post('/wallpaper',
  express.raw({ type: ALLOWED_TYPES, limit: '10mb' }),
  (req, res) => {
    const mimeType = req.headers['content-type'];
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({ detail: 'Unsupported image type. Use JPEG, PNG, GIF, or WebP.' });
    }

    const buffer = req.body;
    if (!buffer || !buffer.length) {
      return res.status(400).json({ detail: 'No image data received' });
    }
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ detail: 'Image too large (max 10MB)' });
    }

    db.prepare(
      "INSERT OR REPLACE INTO user_wallpapers (user_id, image_data, mime_type, updated_at) VALUES (?, ?, ?, datetime('now'))"
    ).run(req.user.id, buffer, mimeType);

    // Also update wallpaper setting to 'image'
    const row = getOrCreateSettings(req.user.id);
    const settings = parseSettingsJson(row.settings_json);
    settings.wallpaper = { type: 'image', value: 'custom' };
    db.prepare('UPDATE user_settings SET settings_json = ? WHERE id = ?')
      .run(JSON.stringify(settings), row.id);

    res.json({ ok: true });
  }
);

// GET /api/settings/wallpaper — serve the user's custom wallpaper
router.get('/wallpaper', (req, res) => {
  const row = db.prepare('SELECT image_data, mime_type, updated_at FROM user_wallpapers WHERE user_id = ?')
    .get(req.user.id);

  if (!row) {
    return res.status(404).json({ detail: 'No custom wallpaper' });
  }

  res.set('Content-Type', row.mime_type);
  res.set('Cache-Control', 'private, max-age=86400');
  res.send(row.image_data);
});

// DELETE /api/settings/wallpaper — remove custom wallpaper
router.delete('/wallpaper', (req, res) => {
  db.prepare('DELETE FROM user_wallpapers WHERE user_id = ?').run(req.user.id);

  // Reset wallpaper setting to theme default
  const row = getOrCreateSettings(req.user.id);
  const settings = parseSettingsJson(row.settings_json);
  settings.wallpaper = { type: 'theme', value: null };
  db.prepare('UPDATE user_settings SET settings_json = ? WHERE id = ?')
    .run(JSON.stringify(settings), row.id);

  res.json({ ok: true });
});

module.exports = router;

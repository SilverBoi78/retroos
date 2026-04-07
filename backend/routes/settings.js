const { Router } = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware');

const router = Router();

router.use(requireAuth);

function getOrCreateSettings(userId) {
  let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  if (!settings) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
    settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  }
  return settings;
}

// GET /api/settings
router.get('/', (req, res) => {
  const settings = getOrCreateSettings(req.user.id);
  res.json({ themeId: settings.theme_id });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const { themeId } = req.body;
  const settings = getOrCreateSettings(req.user.id);

  if (themeId !== undefined && themeId !== null) {
    db.prepare('UPDATE user_settings SET theme_id = ? WHERE id = ?').run(themeId, settings.id);
  }

  res.json({ ok: true });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData, authenticateToken } = require('../middleware/permissionMiddleware');
const { body, validationResult } = require('express-validator');

router.use(addUserData);
router.post('/check-in', [authenticateToken, presensiController.upload.single('image')], presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);
router.get('/today', presensiController.getTodayAttendance);
router.get('/total', presensiController.getTotalAttendance);
router.put(
  '/:id',
  [
    body('waktuCheckIn')
      .isISO8601()
      .withMessage('Format waktuCheckIn tidak valid (harus format tanggal ISO8601)'),
    body('waktuCheckOut')
      .isISO8601()
      .withMessage('Format waktuCheckOut tidak valid (harus format tanggal ISO8601)'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  presensiController.updatePresensi
);

router.delete('/:id', presensiController.deletePresensi);
module.exports = router;

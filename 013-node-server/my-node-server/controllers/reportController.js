const { Presensi } = require('../models');

exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Presensi.findAll({
      where: {
        checkIn: {
          [require('sequelize').Op.gte]: new Date(`${today}T00:00:00`),
          [require('sequelize').Op.lt]: new Date(`${today}T23:59:59`)
        }
      }
    });

    res.json({
      status: 'success',
      reportDate: today,
      data: records
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

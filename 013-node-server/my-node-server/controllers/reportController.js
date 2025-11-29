const { Presensi, User } = require('../models');
const { Op } = require("sequelize");


exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let where = {};

    if (tanggalMulai && tanggalSelesai) {
      where.checkIn = {
        [Op.between]: [new Date(tanggalMulai), new Date(tanggalSelesai)],
      };
    }

    const records = await Presensi.findAll({ 
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'email', 'role'],
        required: false
      }]
    });

    // Filter berdasarkan nama jika ada
    let filtered = records;
    if (nama) {
      filtered = records.filter(r => 
        r.user && r.user.nama && r.user.nama.toLowerCase().includes(nama.toLowerCase())
      );
    }

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: filtered,
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};


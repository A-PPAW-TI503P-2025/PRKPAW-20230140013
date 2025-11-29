// Controller presensi (clean, fixed)
const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize");
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user || {};
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body || {};
    console.log('CheckIn - received body:', req.body);

    const lat = (latitude !== undefined && latitude !== null) ? parseFloat(latitude) : null;
    const lng = (longitude !== undefined && longitude !== null) ? parseFloat(longitude) : null;

    // Cek apakah ada record aktif (belum check-out)
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // Simpan record baru (latitude/longitude opsional)
    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: lat,
      longitude: lng,
    });

    console.log('CheckIn - newRecord created:', newRecord && newRecord.toJSON ? newRecord.toJSON() : newRecord);

    const formattedData = {
      id: newRecord.id,
      userId: newRecord.userId,
      nama: userName,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
      latitude: newRecord.latitude,
      longitude: newRecord.longitude,
    };

    return res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: formattedData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // 1. Cari data di database yang checkOut-nya masih null
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });
    console.log('CheckOut - found record:', recordToUpdate && recordToUpdate.toJSON ? recordToUpdate.toJSON() : recordToUpdate);

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    // 2. LAKUKAN UPDATE DATA
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save(); // Simpan perubahan ke database

    // 3. Format data untuk response
    const formattedData = {
      id: recordToUpdate.id,
      userId: recordToUpdate.userId,
      nama: userName,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      latitude: recordToUpdate.latitude,
      longitude: recordToUpdate.longitude
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });

  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user || {};
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
    await recordToDelete.destroy();
    return res.status(200).json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { waktuCheckIn, waktuCheckOut } = req.body;

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (waktuCheckIn) recordToUpdate.checkIn = new Date(waktuCheckIn);
    if (waktuCheckOut) recordToUpdate.checkOut = new Date(waktuCheckOut);

    await recordToUpdate.save();

    return res.json({ message: "Data presensi berhasil diperbarui.", data: recordToUpdate });
  } catch (error) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const { id: userId } = req.user || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await Presensi.findOne({
      where: {
        userId: userId,
        checkIn: {
          [Op.between]: [today, tomorrow],
        },
      },
    });

    return res.json({ data: record || null });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data presensi hari ini", error: error.message });
  }
};

exports.getTotalAttendance = async (req, res) => {
  try {
    const { id: userId } = req.user || {};

    const count = await Presensi.count({ where: { userId } });
    return res.json({ total: count });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil total kehadiran", error: error.message });
  }
};
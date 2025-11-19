CREATE TABLE IF NOT EXISTS pasien (
    pasien_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(100) NOT NULL,
    tanggal_lahir TIMESTAMP NOT NULL,
    gender VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telepon VARCHAR(20) NOT NULL,
    alamat_lengkap VARCHAR(255) NOT NULL,
    kota VARCHAR(50) NOT NULL,
    provinsi VARCHAR(50) NOT NULL,
    kode_pos VARCHAR(10) NOT NULL,
    golongan_darah VARCHAR(5) NOT NULL,
    nama_kontak_darurat VARCHAR(100) NOT NULL,
    telepon_kontak_darurat VARCHAR(20) NOT NULL,
    tanggal_registrasi TIMESTAMP NOT NULL
);
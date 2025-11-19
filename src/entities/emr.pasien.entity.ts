import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('pasien')
export class PasienEMR {
  @PrimaryGeneratedColumn()
  id_pasien!: number;

  @Column({type: "varchar", length: 50})
  nama_depan!: string;

  @Column({type: "varchar", length: 50})
  nama_belakang!: string;

  @CreateDateColumn()
  tanggal_lahir!: string;

  @Column({type: "varchar", length: 10})
  jenis_kelamin!: string;

  @Column({type: "varchar", length: 100})
  email!: string;

  @Column({type: "varchar", length: 20})
  no_telepon!: string;

  @Column({type: "varchar", length: 200})
  alamat!: string;

  @Column({type: "varchar", length: 50})
  kota!: string;

  @Column({type: "varchar", length: 50})
  provinsi!: string;

  @Column({type: "varchar", length: 10})
  kode_pos!: string;

  @Column({type: "varchar", length: 5})
  golongan_darah!: string;

  @Column({type: "varchar", length: 100})
  kontak_darurat!: string;

  @Column({type: "varchar", length: 20})
  no_kontak_darurat!: string;

  @CreateDateColumn()
  tanggal_registrasi!: string;

}

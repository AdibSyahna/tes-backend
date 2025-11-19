import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('pasien')
export class PasienSIMRS {
  @PrimaryGeneratedColumn('uuid')
  pasien_uuid!: string;

  @Column({type: "varchar", length: 100})
  nama_lengkap!: string;

  @CreateDateColumn()
  tanggal_lahir!: string;

  @Column({type: "varchar", length: 10})
  gender!: string;

  @Column({type: "varchar", length: 100})
  email!: string;

  @Column({type: "varchar", length: 20})
  telepon!: string;

  @Column({type: "varchar", length: 255})
  alamat_lengkap!: string;

  @Column({type: "varchar", length: 50})
  kota!: string;

  @Column({type: "varchar", length: 50})
  provinsi!: string;

  @Column({type: "varchar", length: 10})
  kode_pos!: string;

  @Column({type: "varchar", length: 5})
  golongan_darah!: string;

  @Column({type: "varchar", length: 100})
  nama_kontak_darurat!: string;

  @Column({type: "varchar", length: 20})
  telepon_kontak_darurat!: string;

  @CreateDateColumn()
  tanggal_registrasi!: string;

}

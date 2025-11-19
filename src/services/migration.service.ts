import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityMetadata } from 'typeorm';
import { PasienEMR } from '../entities/emr.pasien.entity';

@Injectable()
export class MigrationService {

    public migrationMessage: string = "Ready.";
    public migrationProgress: number = 0;
    public migrationProcessing: boolean = false;

    constructor(
        @InjectDataSource('emr') private emrDB: DataSource,
        @InjectDataSource('simrs') private simrsDB: DataSource,
        private configService: ConfigService
    ) { }

    private buildColumnList(metadata: EntityMetadata) {
        return metadata.columns.map(col => `"${col.databaseName}"`).join(', ');
    }

    public async startMigration() {
        if (this.migrationProcessing == true) {
            return -1;
        }

        const SourceMetadata = this.emrDB.getMetadata(PasienEMR);
        const SelectColumns = this.buildColumnList(SourceMetadata);

        const startMs = Date.now();
        this.migrationProcessing = true;
        console.info("Migration started.");

        // Count row total in emrDB
        const countEmr = await this.emrDB.query(`SELECT COUNT(*) FROM pasien`);
        console.log(countEmr);
        
        const TotalRow = +countEmr[0].count;
        const BatchSize = +this.configService.get("MAXIMUM_BATCH_SIZE") || 2000;
        const TotalBatch = Math.ceil(TotalRow / BatchSize);

        let lastId = 0;
        let total = 0;
        let currentBatch = 1;

        console.log(`Total Row: ${TotalRow}, Maximum batch size: ${BatchSize}, Total batch: ${TotalBatch}.`);
        while (total < TotalRow) {
            this.migrationMessage = `Processing... (Batch ${currentBatch}/${TotalBatch})`;

            console.info(`Fetching rows from ID ${lastId} to ${lastId + BatchSize}...`);
            const Rows: PasienEMR[] = await this.emrDB.query(/*sql*/
                `SELECT ${SelectColumns} FROM pasien WHERE id_pasien > $1 ORDER BY id_pasien ASC LIMIT $2`,
                [lastId, BatchSize],
            );
            if (!Rows.length) break;
            
            console.info(`Rows fetched (${Rows.length} rows queried).`);

            const InsertColumns = [
                "nama_lengkap",
                "tanggal_lahir",
                "gender",
                "email",
                "telepon",
                "alamat_lengkap",
                "kota",
                "provinsi",
                "kode_pos",
                "golongan_darah",
                "nama_kontak_darurat",
                "telepon_kontak_darurat",
                "tanggal_registrasi"
            ];


            const InsertValues: (string[])[] = [];
            for (let i = 0; i < Rows.length; i++) {
                const PasienEMR = Rows[i]!;
                const Values = [
                    PasienEMR.nama_depan + " " + PasienEMR.nama_belakang,
                    PasienEMR.tanggal_lahir,
                    PasienEMR.jenis_kelamin,
                    PasienEMR.email,
                    PasienEMR.no_telepon,
                    PasienEMR.alamat,
                    PasienEMR.kota,
                    PasienEMR.provinsi,
                    PasienEMR.kode_pos,
                    PasienEMR.golongan_darah,
                    PasienEMR.kontak_darurat,
                    PasienEMR.no_kontak_darurat,
                    PasienEMR.tanggal_registrasi
                ];
                InsertValues.push(Values);
                console.info(`Id ${PasienEMR.id_pasien} processed.`);
            }

            let columnIndex = 1;
            const ValuesTemplate = InsertValues
                .map(row => {
                    const Index = row.map(() => `$${columnIndex++}`).join(',');
                    return `(${Index})`;
                })
                .join(',');

            const InsertSQL = /*sql*/`INSERT INTO pasien (${InsertColumns.join(',')})
             VALUES ${ValuesTemplate}`;

            console.info(`Inserting processed data (${InsertValues.length} rows) to database...`);
            const Parameters = InsertValues.flat();
            await this.simrsDB.query(InsertSQL, Parameters)
            console.info(`Successfully inserted ${InsertValues.length} rows.`);

            lastId = Rows[Rows.length - 1]!.id_pasien;
            total += Rows.length;
            ++currentBatch;
            this.migrationProgress = Math.round(100 * currentBatch / TotalBatch);

            console.log(`Batch ${currentBatch - 1} finished. Last ID: ${lastId}, Total: ${total}`);
        }


        const finishMs = Date.now();
        const Duration = finishMs - startMs;
        this.migrationProcessing = false;
        this.migrationProgress = 100;
        this.migrationMessage = "Finished.";
        console.log(`Migration finished in ${Duration}ms`);
        return Duration;
    }

}

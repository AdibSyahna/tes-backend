import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { MigrationService } from '../services/migration.service';

@Controller("api")
export class APIController {
    constructor(
        private appService: AppService,
        private migrationService: MigrationService
    ) { }

    @Get("/log")
    getLogs() {
        return JSON.stringify(this.appService.logs);
    }

    @Get("/status")
    getStatus() {
        return JSON.stringify(this.migrationService.migrationMessage);
    }

    @Post("/start")
    async startMigration() {
        const Time = await this.migrationService.startMigration();

        if (Time == -1) return {
            message: "Migration already in progress.",
            time: 0
        };
        else return {
            message: "Migration finished.",
            time: Time
        }
    }
}

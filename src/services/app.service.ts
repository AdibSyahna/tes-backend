import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as path from "path";
import * as fs from 'fs';
import { EventEmitter } from 'stream';
import { InjectDataSource } from '@nestjs/typeorm';

type LogTypes = "error" | "log" | "warn" | "info";

@Injectable()
export class AppService implements OnApplicationBootstrap {
  readonly LogMaxHistory = Number(process.env["MAXIMUM_LOG_LENGTH"]) || 100;
  private logStream: fs.WriteStream;

  public logs: { type: LogTypes, content: string }[] = [];
  public logEvent = new EventEmitter();

  constructor(
    @InjectDataSource('emr') private emrDataSource: DataSource,
    @InjectDataSource('simrs') private simrsDataSource: DataSource
  ) {
    const LogFileName = `app.${Date.now()}.log`;
    this.logStream = fs.createWriteStream(LogFileName, { flags: 'a' });
    this.overrideConsoleStreams();
  }

  async onApplicationBootstrap() {
    await this.checkAndCreateTables();
  }

  private async checkAndCreateTables() {
    await this.checkAndRunSql(this.emrDataSource, 'src/sql/emr.pasien.sql', 'EMR');
    await this.checkAndRunSql(this.simrsDataSource, 'src/sql/simrs.pasien.sql', 'SIMRS');
  }

  /**
   * Ensure table exists.
   * 
   * If not, create new table by running SQL file.
   */
  private async checkAndRunSql(dataSource: DataSource, sqlFilePath: string, dbName: string) {
    try {
      const tableExists = await this.tableExists(dataSource, 'pasien');
      if (tableExists) {
        this.manualLog(`${dbName}: Table 'pasien' already exists. Skipping SQL execution.`);
        return;
      }
      this.manualLog(`${dbName}: Table 'pasien' does not exist. Executing SQL file: ${sqlFilePath}`);
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      await dataSource.query(sql);
      this.manualLog(`${dbName}: SQL execution completed successfully.`);
    } catch (error) {
      this.manualLog(`${dbName}: Error during table check or SQL execution: ${error}`, 'error');
    }
  }

  /**
   * Check if table exists.
   */
  private async tableExists(dataSource: DataSource, tableName: string): Promise<boolean> {
    const result = await dataSource.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
      [tableName]
    );
    return result[0].exists;
  }

  /**
   * Manually log a message.
   * 
   * @param log The content to log.
   * @param type Type of log: "error", "log", or "warn".
   */
  public manualLog(log: unknown, type: LogTypes = "log"): void {
    const fileName = this.getFileName();
    const content = `[${new Date().toLocaleString()}][${fileName}]` + log;
    const logObject = { type, content };
    this.logs.push(logObject);
    this.logStream.write(`[${type.toUpperCase()}]${content}\n`);
    this.logEvent.emit(type, content);
    while (this.logs.length > this.LogMaxHistory) {
      this.logs.shift(); // Truncate log history
    }
  }

  /**
   * Get file name of the log caller.
   */
  private getFileName(): string {
    const unknown = "unknown caller";
    const stack = (new Error()).stack;
    if (stack) {
      // Extracting the filename from the stack trace
      const stackLines = stack.split('\n');
      for (let i = 0; i < stackLines.length; i++) {
        const callerLine = stackLines[i];
        if (!callerLine) continue;

        const match = callerLine.match(/(?:\s+at\s+)(.*)(?::\d+:\d+)/);
        const currentFileName = path.basename(__filename); // Get the current file name using __dirname
        if (match && match[1] && !match[1].includes(currentFileName)) {
          return path.basename(match[1]); // Extract file name from path
        }
      }

    }
    return unknown; // Fallback if no filename is found
  }

  /**
   * Capture the console streams for logging.
   */
  private captureStream(stream: CallableFunction, type: LogTypes) {
    return (...logs: unknown[]) => {
      logs.forEach((log: unknown) => {
        if (typeof log === "object") log = JSON.stringify(log, null, 2);
        this.manualLog(log, type)
      });
      stream(...logs); // Call original method
    };
  }

  /**
   * Override console methods to capture logs.
   */
  private overrideConsoleStreams(): void {
    console.log = this.captureStream(console.log, "log");
    console.error = this.captureStream(console.error, "error");
    console.warn = this.captureStream(console.warn, "warn");
    console.info = this.captureStream(console.info, "info");
  }
}

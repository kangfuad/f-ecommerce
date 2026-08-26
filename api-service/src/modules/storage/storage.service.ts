import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;
  private readonly storageDriver: 'local' | 's3';

  constructor(private configService: ConfigService) {
    this.storageDriver = this.configService.get<'local' | 's3'>('storage.driver', 'local');
    this.uploadDir = path.resolve(this.configService.get<string>('storage.uploadDir', './uploads'));
    this.publicBaseUrl = this.configService.get<string>('storage.publicBaseUrl', 'http://localhost:3000/uploads');

    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(path.join(this.uploadDir, 'agreements'));
    this.ensureDirectoryExists(path.join(this.uploadDir, 'bills'));
    this.ensureDirectoryExists(path.join(this.uploadDir, 'samples'));
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subfolder = 'general'): Promise<UploadedFileResult> {
    const targetFolder = path.join(this.uploadDir, subfolder);
    this.ensureDirectoryExists(targetFolder);

    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${cleanOriginalName}`;
    const destinationPath = path.join(targetFolder, filename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const url = `${this.publicBaseUrl}/${subfolder}/${filename}`;

    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      path: destinationPath,
    };
  }

  async getFileStream(filePath: string): Promise<fs.ReadStream> {
    return fs.createReadStream(filePath);
  }
}

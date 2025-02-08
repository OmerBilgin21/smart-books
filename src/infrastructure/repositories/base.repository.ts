import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import SmartBooksDataSource from '../db/ormconfig.js';

export class BaseRepository {
  private connection: DataSource | null = null;

  private async getConnection(): Promise<DataSource> {
    if (!this.connection) {
      const connection = await SmartBooksDataSource.initialize();
      this.connection = connection;
      return connection;
    }
    return this.connection;
  }

  protected async getRepository<T extends ObjectLiteral>(
    name: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const connection = await this.getConnection();
    return connection.getRepository(name);
  }
}

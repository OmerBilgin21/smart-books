import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import SmartBooksDataSource from '../db/ormconfig';

export class BaseRepository {
  private async getConnection(): Promise<DataSource> {
    return await SmartBooksDataSource.initialize();
  }

  protected async getRepository<T extends ObjectLiteral>(
    name: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const connection = await this.getConnection();
    return connection.getRepository(name);
  }
}

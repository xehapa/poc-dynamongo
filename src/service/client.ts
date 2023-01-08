import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export class Client {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'ap-southeast-1' });
  }

  connect(): DynamoDBClient {
    return this.client;
  }
}

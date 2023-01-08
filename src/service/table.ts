import {
  CreateTableCommand,
  DeleteTableCommand,
  KeyType,
  ListTablesCommand,
  ProjectionType,
  waitUntilTableExists,
  waitUntilTableNotExists
} from '@aws-sdk/client-dynamodb';
import { Client } from './client';
import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb/dist-types/commands';

export class Table extends Client {
  public static tableName = 'NpsWorkflowAnalyticsAggregate';

  async list(): Promise<string[] | undefined> {
    const { TableNames } = await this.connect().send(new ListTablesCommand({}));
    return TableNames;
  }

  async create(tableName = Table.tableName) {
    const tables = await this.list();
    if (!tables?.find(table => table === tableName)) {
      const AttributeDefinitions = [
        {
          AttributeName: 'Id',
          AttributeType: 'S',
        },
        {
          AttributeName: 'DateCreated',
          AttributeType: 'S',
        },
      ];
      const KeySchema = [
        {
          AttributeName: 'Id',
          KeyType: KeyType.HASH,
        },
        {
          AttributeName: 'DateCreated',
          KeyType: KeyType.RANGE,
        },
      ];

      const ProvisionedThroughput = { ReadCapacityUnits: 10, WriteCapacityUnits: 10 };

      const params: CreateTableCommandInput = {
        TableName: tableName,
        AttributeDefinitions,
        KeySchema,
        ProvisionedThroughput,
        // GlobalSecondaryIndexes: [{
        //   IndexName: 'QuestionsIndex',
        //   KeySchema: [{
        //     AttributeName: 'GSI-Daily',
        //     KeyType: KeyType.HASH,
        //   }],
        //   Projection: { ProjectionType: ProjectionType.INCLUDE, NonKeyAttributes: ['InitialQuestion', 'QuestionData'] },
        //   ProvisionedThroughput
        // }],
        // LocalSecondaryIndexes: [{
        //   IndexName: 'LocalIndex',
        //   KeySchema,
        //   Projection: { ProjectionType: ProjectionType.ALL },
        // }],
      };

      const { TableDescription } = await this.connect().send(new CreateTableCommand(params));

      const wait = await waitUntilTableExists({
        client: this.connect(),
        maxWaitTime: 20,
        maxDelay: 2,
        minDelay: 1,
      }, { TableName: tableName });

      console.log(wait);

      return `Create table '${TableDescription?.TableName}'`;
    }
  }

  async delete() {
    await this.connect().send(new DeleteTableCommand({ TableName: Table.tableName }));
    
    const wait = await waitUntilTableNotExists({ client: this.connect(), maxWaitTime: 20, minDelay: 15 }, { TableName: Table.tableName });

    console.log(wait.state);
    
    return `Table deleted`;
  }
}

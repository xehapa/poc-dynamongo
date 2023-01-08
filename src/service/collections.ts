import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Table } from './table';
import { BatchWriteCommand, DynamoDBDocumentClient, ExecuteStatementCommand, TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { Client } from './client';
import { splitEvery } from 'ramda';
import { AggregatedItem } from '../interfaces';
import { faker } from '@faker-js/faker';

export class Collections {
  private readonly db: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.db = new Client().connect();
    this.docClient = DynamoDBDocumentClient.from(this.db, this.marshallOptions);
  }

  /**
   * Will make batch write request (array length / 25) times
   */
  async create() {
    const items = await this.makeData(73);
    const itemCount = items.length;
    const partLen = 25;
    const partialItems = splitEvery(partLen, items);

    for (let i = 0; i < Math.round(itemCount / partLen); i++) {
      const segments = partialItems[i];
      for (let j = 0; j < partLen; j++) {
        if (segments[j]) {
          await this.docClient.send(new BatchWriteCommand({
            RequestItems: {
              [Table.tableName]: [{
                PutRequest: {
                  Item: segments[j]
                }
              }],
            }
          }));
        }
      }
    }

    return partialItems;
  }

  async read(): Promise<AggregatedItem | null> {
    const data = await this.docClient.send(new ExecuteStatementCommand({
      Statement: `SELECT *
                  FROM ${Table.tableName}
                  where QuestionData[0].Answer = ? `,
      Parameters: ['West sticky hertz South innovative'],
    }));

    return <AggregatedItem | null>data.Items?.pop();
  }

  private get marshallOptions(): TranslateConfig {
    return {
      marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true, convertClassInstanceToMap: false },
      unmarshallOptions: { wrapNumbers: false }
    };
  }

  private async makeData(n = 50): Promise<AggregatedItem[]> {
    let i = 0;
    let items: AggregatedItem[] = [];
    
    do {      
      const [month, date, year] = Intl.DateTimeFormat('en', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(faker.date.between('2020-01-01', new Date())).split('/').filter(d => d !== '/')
      
      items = [...items, {
        Id: `DAILY-${faker.helpers.slugify(faker.name.fullName())}`,
        RecruiterId: faker.random.numeric(4, { allowLeadingZeros: false }),
        WorkflowId: +faker.random.numeric(),
        AgencyId: +faker.random.numeric(),
        DateCreated: `${year}-${month}-${date}`,
        InitialQuestion: {
          Question: faker.random.words(3),
          Answer: faker.random.words(10),
          Score: faker.datatype.number({ max: 10 })
        },
        AverageScore: faker.datatype.float({ max: 100 }),
        AverageTime: faker.datatype.float({ max: 100 }),
        Starts: faker.datatype.number({ max: 20 }),
        Responses: faker.datatype.number(),
        SurveySent: faker.datatype.number(),
        View: faker.datatype.number(),
        QuestionData: [
          {
            Question: 'Test 1?',
            Type: 'text_field',
            Answer: faker.random.words(5)
          },
          {
            Question: 'Test 2?',
            Type: 'multiple_choice',
            Answer: [1, 2, 3, 4]
          }
        ]
      }]

      i += 1;
    } while (i < n);

    return items;
  }
}

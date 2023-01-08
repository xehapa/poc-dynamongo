import express, { Express, Request, Response } from 'express';
import { Client } from './service/client';
import { Table } from "./service/table";
import { Collections} from './service/collections';

const app = <Express>express();

const client = new Client().connect();
const table = new Table();
const collection = new Collections();

app.get('/', async (_, res: Response) => {
  return res.send(`Successfully connected to Dynamo DB with API Version: ${client.config.apiVersion}`);
});

app.get('/tables', async (_, res: Response) => {
  return res.json(await table.list());
});

app.get('/table/create', async (_, res: Response) => {
  return res.send(await table.create());
});

app.get('/table/delete', async (_, res: Response) => {
  return res.send(await table.delete());
});

app.get('/data/write', async (_, res: Response) => {
  return res.json(await collection.create())
});

app.get('/data/read', async (req: Request, res: Response) => {
  return res.json(await collection.read())
})

app.listen(4041, () => {
  console.log('Server is running');
});

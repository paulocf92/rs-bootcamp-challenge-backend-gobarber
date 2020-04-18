import fs from 'fs';
import parse from 'csv-parse';
import path from 'path';
import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(csvFilename: string): Promise<void> {
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.join(uploadConfig.directory, csvFilename);

    const transactions = [] as Transaction[];
    const fileData = await fs.promises.readFile(csvFilePath);

    await new Promise(resolve =>
      parse(fileData, {}, async (err, rows) => {
        if (err) {
          throw new Error(err.message);
        }

        const lines = rows.slice(1);

        await Promise.all(
          lines.map(async (row: string[]) => {
            const [title, type, value, category] = row;
            const transactionData = {
              title,
              type: type.trim(),
              value: parseFloat(value),
              category: category.trim(),
            } as TransactionDTO;

            const transaction = await createTransaction.execute(
              transactionData,
            );

            transactions.push(transaction);
          }),
        );

        resolve(transactions);
      }),
    ).then(results => {
      return results;
    });
  }
}

export default ImportTransactionsService;

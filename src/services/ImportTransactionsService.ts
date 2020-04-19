import fs from 'fs';
import csv from 'csvtojson';
import path from 'path';
import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(csvFilename: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.join(uploadConfig.directory, csvFilename);

    const csvTransactions = await csv().fromFile(csvFilePath);
    csvTransactions.map(async (transaction: CsvTransaction) => {
      await createTransaction.execute({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category,
      });
    });

    const csvFileExists = await fs.promises.stat(csvFilePath);

    if (csvFileExists) {
      await fs.promises.unlink(csvFilePath);
    }

    return csvTransactions;
  }
}

export default ImportTransactionsService;

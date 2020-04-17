import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Results {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Results> {
    const transactions = await this.find({
      relations: ['category'],
      select: ['id', 'title', 'value', 'type'],
    });

    const balance = await this.getBalance();

    return {
      transactions,
      balance,
    };
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = transactions.reduce((total, transaction) => {
      const { type, value } = transaction;
      return type === 'income' ? total + value : total;
    }, 0);
    const outcome = transactions.reduce((total, transaction) => {
      const { type, value } = transaction;
      return type === 'outcome' ? total + value : total;
    }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;

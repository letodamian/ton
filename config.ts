import { Network } from '@orbs-network/ton-access';
import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  isTestOnly: boolean,
  tonscanUrl: string,
  network: Network,
}

export const config: IConfig = {
  isTestOnly: !!process.env.TESTNET,
  tonscanUrl: `https://${process.env.TESTNET ? 'testnet.' : ''}tonscan.org/address/`,
  network: process.env.TESTNET ? 'testnet' : 'mainnet',
}
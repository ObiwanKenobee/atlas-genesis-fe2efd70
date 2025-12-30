import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    hardhat: {},
  },
};

export default config;

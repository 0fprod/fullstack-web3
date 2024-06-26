import { run } from 'hardhat';

export const verify = async (contractAddress: any, args: any): Promise<void> => {
  console.log('Verifying contract...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log('Already verified!');
    } else {
      console.error(error);
    }
  }
};
